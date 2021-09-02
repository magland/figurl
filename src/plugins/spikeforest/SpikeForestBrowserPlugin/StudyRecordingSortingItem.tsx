import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import Expandable from 'figurl/labbox-react/components/Expandable/Expandable';
import React, { FunctionComponent, useMemo } from 'react';
import { SpikeForestData } from './SpikeForestBrowser';

type Props = {
    sfData: SpikeForestData
    studyName: string
    recordingName: string
    sorterName: string
}

const StudyRecordingSortingItem: FunctionComponent<Props> = ({sfData, studyName, recordingName, sorterName}) => {
    const data0 = useMemo(() => (
        sfData.filter(x => ((x.studyName === studyName) && (x.recordingName === recordingName) && (x.sorterName === sorterName)))[0]
    ), [sfData, studyName, recordingName, sorterName])

    const label = data0.sorterName
    const tableData = useMemo(() => (
        [
            {key: 'recordingUri', label: 'Recording URI', value: data0.recordingUri},
            {key: 'firingsUri', label: 'Firings URI', value: data0.firings},
            {key: 'sortingTrueUri', label: 'Sorting true URI', value: data0.sortingTrueUri}
        ]
    ), [data0])
    return (
        <Expandable label={label}>
            <Table>
                <TableBody>
                    {
                        tableData.map(x => (
                            <TableRow key={x.key}>
                                <TableCell>{x.label}</TableCell>
                                <TableCell>{x.value}</TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </Expandable>
    )
}

export default StudyRecordingSortingItem