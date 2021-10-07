import Splitter from 'figurl/labbox-react/components/Splitter/Splitter';
import { ParcelSorting } from 'plugins/sortingview/ParcelExplorerPlugin/ParcelExplorerPlugin';
import React, { FunctionComponent } from 'react';
import { ParcelSortingSelection, ParcelSortingSelectionDispatch } from '../../ViewPlugin';
import OverviewClusterWidget from './OverviewClusterWidget';
import ParcelSortingSelectionWidget from './ParcelSortingSelectionWidget';

type Props = {
    parcelSorting: ParcelSorting
    parcelSortingSelection: ParcelSortingSelection,
    parcelSortingSelectionDispatch: ParcelSortingSelectionDispatch,
    featureRanges: {range: [number, number]}[]
    maxAmplitude: number
    width: number
    height: number
}

const OverviewClusterView: FunctionComponent<Props> = ({parcelSorting, parcelSortingSelection, parcelSortingSelectionDispatch, featureRanges, maxAmplitude, width, height}) => {
    return (
        <div>
            <Splitter
                width={width}
                height={height}
                initialPosition={200}
            >
                <ParcelSortingSelectionWidget
                    parcelSorting={parcelSorting}
                    parcelSortingSelection={parcelSortingSelection}
                    parcelSortingSelectionDispatch={parcelSortingSelectionDispatch}    
                />
                <OverviewClusterWidget
                    parcelSorting={parcelSorting}
                    parcelSortingSelection={parcelSortingSelection}
                    parcelSortingSelectionDispatch={parcelSortingSelectionDispatch}    
                    featureRanges={featureRanges}
                    maxAmplitude={maxAmplitude}
                    width={0} // filled in by splitter
                    height={0} // filled in by splitter
                />
            </Splitter>
        </div>
    )
}

export default OverviewClusterView