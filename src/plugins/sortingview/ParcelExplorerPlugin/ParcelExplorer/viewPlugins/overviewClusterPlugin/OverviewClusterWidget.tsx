import { Grid } from '@material-ui/core';
import { ParcelSorting } from 'plugins/sortingview/ParcelExplorerPlugin/ParcelExplorerPlugin';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import colorForParcelIndex from '../../colorForParcelIndex';
import { ParcelSortingSelection, ParcelSortingSelectionDispatch } from '../../ViewPlugin';
import AverageWaveformWidget from './AverageWaveformWidget/AverageWaveformWidget';
import ClusterWidget, { PointGroup } from './ClusterWidget';
import OverviewClusterToolbar, { OverviewClusterOpts } from './OverviewClusterToolbar';

type Props = {
    parcelSorting: ParcelSorting
    parcelSortingSelection: ParcelSortingSelection
    parcelSortingSelectionDispatch: ParcelSortingSelectionDispatch
    featureRanges: {range: [number, number]}[]
    maxAmplitude: number
    width: number
    height: number
}

const initialOpts: OverviewClusterOpts = {
    mode: 'mode1',
    showDensity: false
}

const OverviewClusterWidget: FunctionComponent<Props> = ({parcelSorting, parcelSortingSelection, parcelSortingSelectionDispatch, featureRanges, maxAmplitude, width, height}) => {
    const segment = useMemo(() => (parcelSorting.segments[parcelSortingSelection.selectedSegmentIndex]), [parcelSorting, parcelSortingSelection.selectedSegmentIndex])
    const selectedParcelIndices = useMemo(() => (
        parcelSortingSelection.selectedParcelRefs.filter(r => (r.segmentIndex === parcelSortingSelection.selectedSegmentIndex)).map(r => (r.parcelIndex))
    ), [parcelSortingSelection])
    const [opts, setOpts] = useState<OverviewClusterOpts>(initialOpts)
    const {pointGroups, selectedPointGroups, xRange, yRange} = useMemo(() => {
        const pointGroups: PointGroup[] = []
        const selectedPointGroups: string[] = []
        let transform: (feature: number[], timestamp: number) => {x: number, y: number} = (f: number[], t: number) => ({x: 0, y: 0})
        let xRange: [number, number]
        let yRange: [number, number]
        if (opts.mode === 'mode1') {
            transform = (feature: number[], timestamp: number) => {
                return {x: feature[0], y: feature[1]}
            }
            xRange = featureRanges[0].range
            yRange = featureRanges[1].range
        }
        else if (opts.mode === 'mode2') {
            transform = (feature: number[], timestamp: number) => {
                return {x: timestamp, y: feature[0]}
            }
            xRange = [segment.start_frame, segment.end_frame]
            yRange = featureRanges[2].range
        }
        else throw Error('Unexpected mode')
        for (let j = 0; j < segment.parcels.length; j++) {
            const parcel = segment.parcels[j]
            const G: PointGroup = {
                key: `${j}`,
                locations: [],
                color: opts.showDensity ? (
                    selectedParcelIndices.includes(j) ? colorForParcelIndex(j) : 'black'
                ) : (
                    selectedParcelIndices.includes(j) ? colorForParcelIndex(j) : (
                        selectedParcelIndices.length === 0 ? colorForParcelIndex(j) : 'gray'
                    )
                )
            }
            if (selectedParcelIndices.includes(j)) {
                selectedPointGroups.push(G.key)
            }
            for (let i = 0; i < parcel.features.length; i++) {
                G.locations.push(transform(parcel.features[i], parcel.timestamps[i]))
            }
            pointGroups.push(G)
        }
        return {pointGroups, selectedPointGroups, xRange, yRange}
    }, [segment, featureRanges, selectedParcelIndices, opts.mode, opts.showDensity])
    const handleSetSelectedPointGroups = useCallback((selectedPointGroups: string[]) => {
        parcelSortingSelectionDispatch({
            type: 'setSelectedParcels',
            selectedParcelRefs: selectedPointGroups.map(a => (
                {segmentIndex: parcelSortingSelection.selectedSegmentIndex, parcelIndex: Number(a)}
            ))
        })
    }, [parcelSortingSelection.selectedSegmentIndex, parcelSortingSelectionDispatch])

    const toolbarHeight = 30

    let W1: number
    let W2: number
    let H: number
    if (opts.mode === 'mode1') {
        W2 = Math.min(120, width / 2)
        W1 = Math.min(width - W2 - 20, height - toolbarHeight)
        H = W1
    }
    else if (opts.mode === 'mode2') {
        W2 = Math.min(120, width / 4)
        W1 = width - W2 - 20
        H = height - toolbarHeight
    }
    else throw Error('Unexpected mode')

    return (
        <div>
            <OverviewClusterToolbar
                opts={opts}
                setOpts={setOpts}
            />
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
                    useDensityColor={opts.showDensity}
                />
                {
                    parcelSortingSelection.selectedParcelRefs.length > 0 && (
                        <AverageWaveformWidget
                            parcelSorting={parcelSorting}
                            parcels={parcelSortingSelection.selectedParcelRefs}
                            maxAmplitude={maxAmplitude}
                            width={W2}
                            height={H}
                        />
                    )
                }
            </Grid>
        </div>
    )
}

// const vectorNorm = (v: number[]) => {
//     const sumsqr = v.map(a => (a * a)).reduce((sum, current) => (sum + current), 0)
//     return Math.sqrt(sumsqr)
// }

export default OverviewClusterWidget