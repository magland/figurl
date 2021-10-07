import { ParcelSorting } from 'plugins/sortingview/ParcelExplorerPlugin/ParcelExplorerPlugin';
import React, { FunctionComponent } from 'react';
import { parcelRefToString, ParcelSortingSelection, ParcelSortingSelectionDispatch } from '../../ViewPlugin';
import SegmentsTable from '../segmentsTablePlugin/SegmentsTable';

type Props = {
    parcelSorting: ParcelSorting
    parcelSortingSelection: ParcelSortingSelection,
    parcelSortingSelectionDispatch: ParcelSortingSelectionDispatch,
}

const ParcelSortingSelectionWidget: FunctionComponent<Props> = ({parcelSorting, parcelSortingSelection, parcelSortingSelectionDispatch}) => {
    return (
        <div>
            <h4>Selected parcels:</h4>
            {
                parcelSortingSelection.selectedParcelRefs.map(r => (
                    <span key={parcelRefToString(r)}>{parcelRefToString(r)}&nbsp;&nbsp;</span>
                ))
            }
            <h4>Selected segment:</h4>
            <SegmentsTable
                parcelSorting={parcelSorting}
                parcelSortingSelection={parcelSortingSelection}
                parcelSortingSelectionDispatch={parcelSortingSelectionDispatch}
            />
            
        </div>
    )
}

export default ParcelSortingSelectionWidget