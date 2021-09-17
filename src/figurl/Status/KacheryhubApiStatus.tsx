import { useKacheryNode } from 'figurl/kachery-react';
import { sleepMsec } from 'plugins/sortingview/ExperitimeTimeseriesPlugin/interface/TimeseriesSelection';
import React, { FunctionComponent, useEffect } from 'react';
import TestJobView from './TestJobView';
import useTestJob from './useTestJob';

type Props = {

}

const KacheryhubApiStatus: FunctionComponent<Props> = () => {
    const job = useTestJob('Kacheryhub API')
    const kacheryNode = useKacheryNode()
    const {setStatus, setText} = job
    useEffect(() => {
        setStatus('waiting')
        setText('')
        ;(async () => {
            setText('Getting node config')
            await sleepMsec(1000)
            const nodeConfig = await kacheryNode.kacheryHubInterface().getNodeConfig()
            if (!nodeConfig) {
                setStatus('error')
                setText('nodeConfig is undefined')
                return
            }
            setStatus('finished')
            console.info('Node config:')
            console.info(nodeConfig)
            const channels = (nodeConfig.channelMemberships || []).map(cm => (cm.channelName))
            setText(`This node belongs to channels: ${channels.join(', ')}`)
        })()
    }, [job.refreshCode, setStatus, setText, kacheryNode])
    return (
        <div>
            <TestJobView testJob={job} />
        </div>
    )
}

export default KacheryhubApiStatus