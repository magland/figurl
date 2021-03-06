import { sleepMsecNum } from 'commonInterface/util/util';
import { useKacheryNode } from 'figurl/kachery-react';
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
            await sleepMsecNum(1000)
            const channelMemberships = await kacheryNode.kacheryHubInterface().getChannelMemberships()
            if (!channelMemberships) {
                setStatus('error')
                setText('channelMemberships is undefined')
                return
            }
            setStatus('finished')
            console.info('Channel memberships:')
            console.info(channelMemberships)
            const channels = (channelMemberships || []).map(cm => (cm.channelName))
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