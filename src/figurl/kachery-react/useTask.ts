import { JSONStringifyDeterministic, TaskFunctionId, TaskFunctionType, TaskKwargs } from "commonInterface/kacheryTypes";
import { useCallback, useEffect, useMemo, useState } from "react";
import initiateTask, { Task } from "./initiateTask";
import useChannel from "./useChannel";
import useKacheryNode from "./useKacheryNode";

const useTask = <ReturnType>(functionId: TaskFunctionId | string | undefined, kwargs: TaskKwargs | {[key: string]: any}, functionType: TaskFunctionType, opts: {queryUseCache?: boolean, queryFallbackToCache?: boolean}) => {
    const [task, setTask] = useState<Task<ReturnType> | undefined>(undefined)
    const kacheryNode = useKacheryNode()
    const [, setUpdateCode] = useState<number>(0)
    const incrementUpdateCode = useCallback(() => {setUpdateCode(c => (c+1))}, [])
    const kwargsString = JSONStringifyDeterministic(kwargs)
    const {channelName, backendId} = useChannel()
    useEffect(() => {
        if (!channelName) return
        if (!functionId) return
        let valid = true
        
        const kwargs2 = JSON.parse(kwargsString) as any as TaskKwargs

        const onStatusChanged = () => {
            if (!valid) return
            incrementUpdateCode()
        }

        const t = initiateTask<ReturnType>({
            kacheryNode,
            channelName,
            backendId,
            functionId,
            kwargs: kwargs2,
            functionType,
            onStatusChanged,
            queryUseCache: opts.queryUseCache, // check the cache first, but also submit the query
            queryFallbackToCache: opts.queryFallbackToCache // submit the query, and if that times out, use the cache
        })
        
        setTask(t)

        return () => {
            valid = false
        }
    }, [functionId, kwargsString, functionType, channelName, backendId, kacheryNode, incrementUpdateCode, opts.queryUseCache, opts.queryFallbackToCache])
    const taskStatus = task ? task.status : undefined
    const returnValue = useMemo(() => {
        if (!task) return undefined
        return taskStatus === 'finished' ? task.result : undefined
    }, [task, taskStatus])
    return useMemo(() => ({
        returnValue,
        task
    }), [returnValue, task])
}

export default useTask