import { ParcelSorting } from 'plugins/sortingview/ParcelExplorerPlugin/ParcelExplorerPlugin';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { ParcelSortingSelection } from '../../ViewPlugin';
import ClusterWidget, { PointGroup } from './ClusterWidget';

type Props = {
    parcelSorting: ParcelSorting
    parcelSortingSelection: ParcelSortingSelection
    featureRanges: {range: [number, number]}[]
    width: number
    height: number
}

const OverviewClusterWidget: FunctionComponent<Props> = ({parcelSorting, parcelSortingSelection, featureRanges, width, height}) => {
    const segment = useMemo(() => (parcelSorting.segments[parcelSortingSelection.selectedSegmentIndex]), [parcelSorting, parcelSortingSelection.selectedSegmentIndex])
    const [selectedParcelIndices, setSelectedParcelIndices] = useState<number[]>([])
    const {pointGroups, selectedPointGroups, xRange, yRange} = useMemo(() => {
        const pointGroups: PointGroup[] = []
        const selectedPointGroups: string[] = []
        for (let j = 0; j < segment.parcels.length; j++) {
            const parcel = segment.parcels[j]
            const G: PointGroup = {
                key: `${j}`,
                locations: []
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
        setSelectedParcelIndices(selectedPointGroups.map(a => (Number(a))))
    }, [])
    const W = Math.min(width, height)
    const H = W
    return (
        <div>
            <ClusterWidget
                pointGroups={pointGroups}
                selectedPointGroups={selectedPointGroups}
                setSelectedPointGroups={handleSetSelectedPointGroups}
                xRange={xRange}
                yRange={yRange}
                xLabel={"X"}
                yLabel={"Y"}
                width={W}
                height={H}
            />
        </div>
    )
}

export default OverviewClusterWidget