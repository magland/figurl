import { Grid } from '@material-ui/core';
import { ParcelSorting } from 'plugins/sortingview/ParcelExplorerPlugin/ParcelExplorerPlugin';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import colorForParcelIndex from '../../colorForParcelIndex';
import { ParcelSortingSelection, ParcelSortingSelectionDispatch } from '../../ViewPlugin';
import AverageWaveformWidget from './AverageWaveformWidget/AverageWaveformWidget';
import ClusterWidget, { PointGroup } from './ClusterWidget';

type Props = {
    parcelSorting: ParcelSorting
    parcelSortingSelection: ParcelSortingSelection
    parcelSortingSelectionDispatch: ParcelSortingSelectionDispatch
    featureRanges: {range: [number, number]}[]
    maxAmplitude: number
    width: number
    height: number
}

const OverviewClusterWidget: FunctionComponent<Props> = ({parcelSorting, parcelSortingSelection, parcelSortingSelectionDispatch, featureRanges, maxAmplitude, width, height}) => {
    const segment = useMemo(() => (parcelSorting.segments[parcelSortingSelection.selectedSegmentIndex]), [parcelSorting, parcelSortingSelection.selectedSegmentIndex])
    const selectedParcelIndices = useMemo(() => (
        parcelSortingSelection.selectedParcelRefs.filter(r => (r.segmentIndex === parcelSortingSelection.selectedSegmentIndex)).map(r => (r.parcelIndex))
    ), [parcelSortingSelection])
    const {pointGroups, selectedPointGroups, xRange, yRange} = useMemo(() => {
        const pointGroups: PointGroup[] = []
        const selectedPointGroups: string[] = []
        for (let j = 0; j < segment.parcels.length; j++) {
            const parcel = segment.parcels[j]
            const G: PointGroup = {
                key: `${j}`,
                locations: [],
                color: (selectedParcelIndices.length === 0) || selectedParcelIndices.includes(j) ? colorForParcelIndex(j) : 'black'
            }
            if (selectedParcelIndices.includes(j)) {
                selectedPointGroups.push(G.key)
            }
            for (let i = 0; i < parcel.features.length; i++) {
                G.locations.push({x: parcel.features[i][0], y: parcel.features[i][1]})
            }
            pointGroups.push(G)
        }
        const xRange = featureRanges[0].range
        const yRange = featureRanges[1].range
        return {pointGroups, selectedPointGroups, xRange, yRange}
    }, [segment, featureRanges, selectedParcelIndices])
    const handleSetSelectedPointGroups = useCallback((selectedPointGroups: string[]) => {
        parcelSortingSelectionDispatch({
            type: 'setSelectedParcels',
            selectedParcelRefs: selectedPointGroups.map(a => (
                {segmentIndex: parcelSortingSelection.selectedSegmentIndex, parcelIndex: Number(a)}
            ))
        })
    }, [parcelSortingSelection.selectedSegmentIndex, parcelSortingSelectionDispatch])
    
    const W2 = Math.min(150, width / 2)
    const W1 = Math.min(width - W2 - 20, height)
    const H = W1

    return (
        <Grid container>
            <ClusterWidget
                pointGroups={pointGroups}
                selectedPointGroups={selectedPointGroups}
                setSelectedPointGroups={handleSetSelectedPointGroups}
                xRange={xRange}
                yRange={yRange}
                xLabel={"X"}
                yLabel={"Y"}
                width={W1}
                height={H}
                pointRadius={1}
                useDensityColor={false}
            />
            {
                parcelSortingSelection.selectedParcelRefs.length === 1 && (
                    <AverageWaveformWidget
                        parcelSorting={parcelSorting}
                        parcel={parcelSortingSelection.selectedParcelRefs[0]}
                        maxAmplitude={maxAmplitude}
                        width={W2}
                        height={H}
                    />
                )
            }
        </Grid>
    )
}

export default OverviewClusterWidget