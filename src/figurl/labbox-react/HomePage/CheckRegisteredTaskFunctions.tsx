import { useChannel, useKacheryNode } from 'figurl/kachery-react'
import { RegisteredTaskFunction } from 'kacheryInterface/kacheryHubTypes'
import { TaskFunctionId } from 'commonInterface/kacheryTypes'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import Hyperlink from '../components/Hyperlink/Hyperlink'

type Props = {
    taskFunctionIds: TaskFunctionId[]
}

const CheckRegisteredTaskFunctions: FunctionComponent<Props> = ({taskFunctionIds}) => {
    const {channelName, backendId} = useChannel()
    const kacheryNode = useKacheryNode()
    const [registeredTaskFunctions, setRegisteredTaskFunctions] = useState<RegisteredTaskFunction[] | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const [probing, setProbing] = useState<boolean>(false)
    const incrementRefreshCode = useCallback(() => setRefreshCode(c => (c + 1)), [])
    const [expanded, setExpanded] = useState<boolean>(false)
    const toggleExpanded = useCallback(() => {
        setExpanded(a => (!a))
    }, [])
    useEffect(() => {
        const update = () => {
            const A: RegisteredTaskFunction[] = []
            for (let id of taskFunctionIds) {
                const a = kacheryNode.kacheryHubInterface().getRegisteredTaskFunction(channelName, id)
                if (a) {
                    A.push(a.registeredTaskFunction)
                }
            }
            setRegisteredTaskFunctions(A)
        }
        const {cancel} = kacheryNode.kacheryHubInterface().onRegisteredTaskFunctionsChanged(() => {
            update()
        })
        update()
        kacheryNode.kacheryHubInterface().probeTaskFunctionsFromChannel({channelName, backendId, taskFunctionIds})
        let canceled = false
        setProbing(true)
        setTimeout(() => {
            if (canceled) return
            setProbing(false)
        }, 5000)
        return () => {
            canceled = true
            cancel()
        }
    }, [kacheryNode, channelName, backendId, taskFunctionIds, refreshCode])

    const numRegistered = (registeredTaskFunctions || []).length
    const registeredTaskFunctionIds = useMemo(() => (
        (registeredTaskFunctions || []).map(a => (a.taskFunctionId))
    ), [registeredTaskFunctions])

    const color = useMemo(() => {
        if (numRegistered === taskFunctionIds.length) {
            return 'darkgreen'
        }
        else if (taskFunctionIds.length > 0) {
            return 'darkred'
        }
        else return 'black'
    }, [numRegistered, taskFunctionIds.length])

    const handleRefresh = useCallback(() => {
        kacheryNode.kacheryHubInterface().clearRegisteredTaskFunctions()
        setRegisteredTaskFunctions(undefined)
        incrementRefreshCode()
    }, [incrementRefreshCode, kacheryNode])

    if ((!registeredTaskFunctions) || ((numRegistered === 0) && (probing))) return <span />
    if (numRegistered !== taskFunctionIds.length) {
        for (let id of taskFunctionIds) {
            if (!registeredTaskFunctions.map(a => (a.taskFunctionId)).includes(id)) {
                console.log(`Not registered: ${id}`)
            }
        }
    }
    return (
        <span>
            <div>Task functions: <Hyperlink onClick={toggleExpanded}><span style={{color}}>{numRegistered} of {taskFunctionIds.length} registered</span></Hyperlink> <Hyperlink onClick={handleRefresh}>refresh</Hyperlink></div>
            {
                expanded && (
                    <div>
                        {
                            taskFunctionIds.map(tfi => (
                                <span key={tfi.toString()}><span style={{color: registeredTaskFunctionIds.includes(tfi) ? 'darkgreen' : 'darkred'}}>{tfi}</span> &nbsp;&nbsp;<span>|</span>&nbsp;&nbsp; </span>
                            ))
                        }
                    </div>
                )
            }
        </span>
    )
}

export default CheckRegisteredTaskFunctions