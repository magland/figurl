import { IconButton } from '@material-ui/core';
import { Replay } from '@material-ui/icons';
import React, { FunctionComponent } from 'react';
import { TestJob, TestStatus } from './useTestJob';

type Props = {
    testJob: TestJob
}

const TestJobView: FunctionComponent<Props> = ({testJob}) => {
    return (
        <div>
            <IconButton onClick={testJob.refresh}><Replay /></IconButton>
            {testJob.label} {` | `} <StatusElement status={testJob.status} /> {` | `} {testJob.text}
            
        </div>
    )
}

const StatusElement: FunctionComponent<{status: TestStatus}> = ({status}) => {
    let color = 'black'
    if (status === 'finished') color = 'darkgreen'
    else if (status === 'error') color = 'darkred'
    else if (status === 'waiting') color = 'darkblue'
    return (
        <span style={{color, fontWeight: 'bold'}}>{status}</span>
    )
}

export default TestJobView