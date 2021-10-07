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
            <SegmentsTable
                parcelSorting={parcelSorting}
                parcelSortingSelection={parcelSortingSelection}
                parcelSortingSelectionDispatch={parcelSortingSelectionDispatch}
            />
            <h3>Selected parcels:</h3>
            {
                parcelSortingSelection.selectedParcelRefs.map(r => (
                    <span>{parcelRefToString(r)}&nbsp;&nbsp;</span>
                ))
            }
        </div>
    )
}

export default ParcelSortingSelectionWidget