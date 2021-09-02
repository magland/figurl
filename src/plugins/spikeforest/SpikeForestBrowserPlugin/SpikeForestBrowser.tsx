import { usePureCalculationTask } from 'figurl/kachery-react';
import TaskStatusView from 'figurl/kachery-react/components/TaskMonitor/TaskStatusView';
import React, { FunctionComponent, useMemo } from 'react';
import { SpikeForestBrowserData } from './SpikeForestBrowserPlugin';
import StudyItem from './StudyItem';
import uniqueSorted from './uniqueSorted';

type Props = {
    width: number
    height: number
    data: SpikeForestBrowserData
}

export type SpikeForestData = {
    consoleOut: string
    container: string
    cpuTimeSec: number
    endTime: string
    firings: string
    processorName: string
    processorVersion: string
    recordingName: string
    recordingUri: string
    returnCode: number
    sorterName: string
    sortingParameters: {[key: string]: any}
    sortingTrueUri: string
    startTime: string
    studyName: string
    timedOut: boolean
}[]



const SpikeForestBrowser: FunctionComponent<Props> = ({width, height, data}) => {
    const {uri} = data
    const {returnValue: sfData, task} = usePureCalculationTask<SpikeForestData>('spikeforest.load-spikeforest-data.1', {uri}, {})
    const studyNames: string[] | undefined = useMemo(() => {
        if (!sfData) return undefined
        return uniqueSorted(sfData.map(x => (x.studyName)))
        
    }, [sfData])
    return (
        <div style={{margin: 15}}>
            {
                sfData ? (
                    <div>
                        {
                            (studyNames || []).map(studyName => (
                                <StudyItem key={studyName} sfData={sfData} studyName={studyName} />
                            ))
                        }
                    </div>
                    
                ) : (
                    <TaskStatusView task={task} label="Loading spikeforest data" />
                )
            }
        </div>
    )
}

export default SpikeForestBrowser