import { useChannel, useQueryTask } from 'figurl/kachery-react'
import TaskStatusView from 'figurl/kachery-react/components/TaskMonitor/TaskStatusView'
import { TaskFunctionId } from 'kachery-js/types/kacheryTypes'
import React, { FunctionComponent } from 'react'
import CheckRegisteredTaskFunctions from './CheckRegisteredTaskFunctions'

type Props = {
    packageName: string
    taskFunctionIds: string[]
    getPythonPackageVersionTaskFunctionId: string
    expectedPythonPackageVersion: string
}

const CheckBackend: FunctionComponent<Props> = ({packageName, taskFunctionIds, getPythonPackageVersionTaskFunctionId, expectedPythonPackageVersion}) => {
    const {channelName} = useChannel()

    const {returnValue: version, task} = useQueryTask<string>(getPythonPackageVersionTaskFunctionId, {}, {useCache: false})
    if (!channelName) return <span />
    if (!version) {
        return <TaskStatusView label={`Checking backend package version for ${packageName}`} task={task} />
    }
    return (
        <div>
            <div>
                Backend package version: {packageName} {version}
            </div>
            <CheckRegisteredTaskFunctions
                taskFunctionIds={taskFunctionIds.map(x => (x as any as TaskFunctionId))}
            />
        </div>
    )
}

export default CheckBackend