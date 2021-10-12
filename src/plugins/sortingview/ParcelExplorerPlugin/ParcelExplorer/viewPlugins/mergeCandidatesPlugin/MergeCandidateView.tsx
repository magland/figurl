import { ParcelSorting } from 'plugins/sortingview/ParcelExplorerPlugin/ParcelExplorerPlugin';
import React, { FunctionComponent } from 'react';
import { ParcelSortingSelection, ParcelSortingSelectionDispatch } from '../../ViewPlugin';
import ClusterComparisonView from '../clusterComparisonPlugin/ClusterComparisonView';

type Props = {
    parcelSorting: ParcelSorting
    parcelSortingSelection: ParcelSortingSelection
    parcelSortingSelectionDispatch: ParcelSortingSelectionDispatch
    featureRanges: {range: [number, number]}[]
    maxAmplitude: number
    width: number
    height: number
}

const MergeCandidateView: FunctionComponent<Props> = ({parcelSorting, parcelSortingSelection, parcelSortingSelectionDispatch, featureRanges, maxAmplitude, width, height}) => {
    return (
        <ClusterComparisonView
            parcelSorting={parcelSorting}
            parcelSortingSelection={parcelSortingSelection}
            parcelSortingSelectionDispatch={parcelSortingSelectionDispatch}
            featureRanges={featureRanges}
            maxAmplitude={maxAmplitude}
            width={width}
            height={height}
        />
    )
}

export default MergeCandidateView