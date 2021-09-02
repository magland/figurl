import React, { FunctionComponent, useMemo } from 'react';
import { SpikeForestData } from './SpikeForestBrowser';
import StudyRecordingItem from './StudyRecordingItem';
import uniqueSorted from './uniqueSorted';

type Props = {
    sfData: SpikeForestData
    studyName: string
}

const StudyItem: FunctionComponent<Props> = ({sfData, studyName}) => {
    const sfData0 = useMemo(() => (
        sfData.filter(x => (x.studyName === studyName))
    ), [sfData, studyName])
    const recordingNames: string[] = useMemo(() => {
        return uniqueSorted(sfData0.map(x => (x.recordingName)))    
    }, [sfData0])
    return (
        <div>
            <h2>{studyName}</h2>
            {
                recordingNames.map(recordingName => (
                    <StudyRecordingItem key={recordingName} sfData={sfData0} studyName={studyName} recordingName={recordingName} />
                ))
            }
        </div>
    )
}

export default StudyItem