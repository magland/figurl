import Expandable from 'figurl/labbox-react/components/Expandable/Expandable';
import React, { FunctionComponent, useMemo } from 'react';
import { SpikeForestData } from './SpikeForestBrowser';
import StudyRecordingSortingItem from './StudyRecordingSortingItem';
import uniqueSorted from './uniqueSorted';

type Props = {
    sfData: SpikeForestData
    studyName: string
    recordingName: string
}

const StudyRecordingItem: FunctionComponent<Props> = ({sfData, studyName, recordingName}) => {
    const sfData0 = useMemo(() => (
        sfData.filter(x => ((x.studyName === studyName) && (x.recordingName === recordingName)))
    ), [sfData, studyName, recordingName])
    const sorterNames: string[] = useMemo(() => {
        return uniqueSorted(sfData0.map(x => (x.sorterName)))    
    }, [sfData0])
    const label = `${recordingName} (${sorterNames.length} sorters)` 
    return (
        <Expandable label={label}>
            {
                sorterNames.map(sorterName => (
                    <StudyRecordingSortingItem key={sorterName} sfData={sfData0} studyName={studyName} recordingName={recordingName} sorterName={sorterName}>{sorterName}</StudyRecordingSortingItem>
                ))
            }
        </Expandable>
    )
}

export default StudyRecordingItem