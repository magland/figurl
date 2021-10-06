import { Radio } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
import { ParcelSorting } from '../ParcelExplorerPlugin';

type Props = {
    parcelSorting: ParcelSorting
    currentSegmentIndex: number
    setCurrentSegmentIndex: (x: number) => void
}

const SelectSegmentControl: FunctionComponent<Props> = ({parcelSorting, currentSegmentIndex, setCurrentSegmentIndex}) => {
    return (
        <div>
            <h3>Select a segment</h3>
            {
                parcelSorting.segments.map((s, ii) => (
                    <span key={ii}><Radio checked={ii === currentSegmentIndex} onClick={() => {setCurrentSegmentIndex(ii)}} /> Segment {ii}</span>
                ))
            }
        </div>
    )
}

export default SelectSegmentControl