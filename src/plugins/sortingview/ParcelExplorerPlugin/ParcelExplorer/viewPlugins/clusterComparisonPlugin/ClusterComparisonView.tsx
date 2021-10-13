import { Grid } from '@material-ui/core';
import { ParcelSorting } from 'plugins/sortingview/ParcelExplorerPlugin/ParcelExplorerPlugin';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import colorForParcelIndex from '../../colorForParcelIndex';
import { ParcelRef, parcelRefFromString, parcelRefToString, ParcelSortingSelection, ParcelSortingSelectionDispatch, SpikeEventRef } from '../../ViewPlugin';
import ClusterWidget, { PointGroup } from '../overviewClusterPlugin/ClusterWidget';
import SpikeWaveformWidget from './SpikeWaveformWidget/SpikeWaveformWidget';

type Props = {
    parcelSorting: ParcelSorting
    parcelSortingSelection: ParcelSortingSelection,
    parcelSortingSelectionDispatch: ParcelSortingSelectionDispatch,
    featureRanges: {range: [number, number]}[]
    maxAmplitude: number
    width: number
    height: number
}

const prepareFeatureTransform = (a: {parcelSorting: ParcelSorting, p1?: ParcelRef, p2?: ParcelRef, mode: 'mode1' | 'mode2'}) => {
    const {parcelSorting, p1, p2, mode} = a

    const getFeaturesForParcel = (p?: ParcelRef) => {
        if (!p) return []
        const segment = parcelSorting.segments[p.segmentIndex]
        const parcel = segment.parcels[p.parcelIndex]
        return parcel.features
    }
    const meanVector = (vectors: number[][]) => {
        if (vectors.length === 0) return []
        const n = vectors[0].length
        const ret: number[] = []
        for (let i=0; i<n; i++) ret.push(0)
        for (let i=0; i<n; i++) {
            for (let j=0; j<vectors.length; j++) {
                ret[i] += vectors[j][i]
            }
        }
        for (let i=0; i<n; i++) ret[i] /= vectors.length
        return ret
    }
    const subtractVectors = (v1: number[], v2: number[]) => {
        return v1.map((a, ii) => (v1[ii] - v2[ii]))
    }
    const vectorMidpoint = (v1: number[], v2: number[]) => {
        return v1.map((a, ii) => ((v1[ii] + v2[ii]) / 2))
    }
    const normalizeVector = (v: number[]) => {
        const sumsqr = innerProduct(v, v)
        if (sumsqr === 0) return v
        const norm = Math.sqrt(sumsqr)
        return v.map(a => (a / norm))
    }
    const principleDirection = (N: number, ind: number) => {
        const ret: number[] = []
        for (let i=0; i<N; i++) {
            ret.push(i === ind ? 1 : 0)
        }
        return ret
    }
    const innerProduct = (v1: number[], v2: number[]) => {
        let ret = 0
        for (let i=0; i<v1.length; i++)
            ret += v1[i] * v2[i]
        return ret
    }
    const subtractOutDirection = (v: number[], direction: number[]) => {
        const a = innerProduct(v, direction)
        const ret: number[] = [...v]
        for (let i=0; i<ret.length; i++) {
            ret[i] -= direction[i] * a
        }
        return ret
    }

    let transform: (f: number[], t: number) => [number, number]
    if ((p1) && (p2)) {
        const features1 = getFeaturesForParcel(p1)
        const features2 = getFeaturesForParcel(p2)
        const N = features1.length > 0 ? features1[0].length : 0
        const mean1 = meanVector(features1)
        const mean2 = meanVector(features2)
        const delta = subtractVectors(mean2, mean1)
        const direction1 = normalizeVector(delta)
        const offset1 = -innerProduct(direction1, vectorMidpoint(mean1, mean2))
        const e1 = principleDirection(N, 0)
        const v2 = subtractOutDirection(e1, direction1)
        const direction2 = normalizeVector(v2)

        if (mode === 'mode1') {
            transform = (f: number[], t: number): [number, number] => {
                return [
                    innerProduct(f, direction1) + offset1,
                    innerProduct(f, direction2)
                ]
            }
        }
        else if (mode === 'mode2') {
            transform = (f: number[], t: number): [number, number] => {
                return [
                    t,
                    innerProduct(f, direction1) + offset1
                ]
            }
        }
        else throw Error('unexpected mode')
    }
    else {
        transform = (f: number[]): [number, number] => {
            return [
                f[0],
                f[1]
            ]
        }
    }
    return transform
}

const ClusterComparisonView: FunctionComponent<Props> = ({parcelSorting, parcelSortingSelection, parcelSortingSelectionDispatch, featureRanges, maxAmplitude, width, height}) => {
    const p1: ParcelRef | undefined = useMemo(() => (parcelSortingSelection.selectedParcelRefs[0]), [parcelSortingSelection.selectedParcelRefs])
    const p2: ParcelRef | undefined = useMemo(() => (parcelSortingSelection.selectedParcelRefs[1]), [parcelSortingSelection.selectedParcelRefs])

    const [currentSpikeEvent, setCurrentSpikeEvent] = useState<SpikeEventRef | undefined>(undefined)

    const {pointGroups, xRange, yRange} = useMemo(() => {
        const pointGroups: PointGroup[] = []
        const transform = prepareFeatureTransform({parcelSorting, p1, p2, mode: 'mode1'})
        for (let p of [p1, p2]) {
            if (p) {
                const segment = parcelSorting.segments[p.segmentIndex]
                const parcel = segment.parcels[p.parcelIndex]
                const G: PointGroup = {
                    key: parcelRefToString(p),
                    locations: [],
                    color: colorForParcelIndex(p.parcelIndex)
                }
                for (let i = 0; i < parcel.features.length; i++) {
                    const a = transform(parcel.features[i], parcel.timestamps[i])
                    G.locations.push({x: a[0], y: a[1]})
                }
                pointGroups.push(G)
            }
        }
        const xRange = undefined
        const yRange = undefined
        return {pointGroups, xRange, yRange}
    }, [p1, p2, parcelSorting])

    const handleClickPoint = useCallback((p: {pointGroupKey: string, pointIndex: number}) => {
        const parcelRef = parcelRefFromString(p.pointGroupKey)
        const e: SpikeEventRef = {
            segmentIndex: parcelRef.segmentIndex,
            parcelIndex: parcelRef.parcelIndex,
            spikeEventIndex: p.pointIndex
        }
        setCurrentSpikeEvent(e)
    }, [])

    const spikeEvents = useMemo(() => (currentSpikeEvent ? [currentSpikeEvent] : undefined), [currentSpikeEvent])

    const W2 = Math.min(120, width / 2)
    const W1 = Math.min(width - W2 - 20, height)
    const H = W1

    if (![1, 2].includes(parcelSortingSelection.selectedParcelRefs.length)) {
        return <div>You must select one or two parcels for comparison</div>
    }
    return (
        <Grid container>
            <ClusterWidget
                pointGroups={pointGroups}
                xRange={xRange}
                yRange={yRange}
                xLabel={"X"}
                yLabel={"Y"}
                width={W1}
                height={H}
                pointRadius={3}
                useDensityColor={false}
                onClickPoint={handleClickPoint}
            />
            {
                spikeEvents && (
                    <SpikeWaveformWidget
                        parcelSorting={parcelSorting}
                        spikeEvents={spikeEvents}
                        maxAmplitude={maxAmplitude}
                        width={W2}
                        height={H}
                    />
                )
            }
        </Grid>
    )
}

export default ClusterComparisonView