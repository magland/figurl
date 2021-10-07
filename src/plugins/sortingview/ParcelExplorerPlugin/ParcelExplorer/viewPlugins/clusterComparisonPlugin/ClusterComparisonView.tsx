import { ParcelSorting } from 'plugins/sortingview/ParcelExplorerPlugin/ParcelExplorerPlugin';
import React, { FunctionComponent, useMemo } from 'react';
import { ParcelRef, parcelRefToString, ParcelSortingSelection, ParcelSortingSelectionDispatch } from '../../ViewPlugin';
import ClusterWidget, { PointGroup } from '../overviewClusterPlugin/ClusterWidget';

type Props = {
    parcelSorting: ParcelSorting
    parcelSortingSelection: ParcelSortingSelection,
    parcelSortingSelectionDispatch: ParcelSortingSelectionDispatch,
    featureRanges: {range: [number, number]}[]
    width: number
    height: number
}

const prepareFeatureTransform = (a: {parcelSorting: ParcelSorting, p1?: ParcelRef, p2?: ParcelRef}) => {
    const {parcelSorting, p1, p2} = a

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

    const features1 = getFeaturesForParcel(p1)
    const features2 = getFeaturesForParcel(p2)
    const N = features1.length > 0 ? features1[0].length : 0
    const mean1 = meanVector(features1)
    const mean2 = meanVector(features2)
    const delta = subtractVectors(mean2, mean1)
    const direction1 = normalizeVector(delta)
    const e1 = principleDirection(N, 0)
    const v2 = subtractOutDirection(e1, direction1)
    const direction2 = normalizeVector(v2)

    const transform = (f: number[]): [number, number] => {
        return [
            innerProduct(f, direction1),
            innerProduct(f, direction2)
        ]
    }
    return transform
}

const ClusterComparisonView: FunctionComponent<Props> = ({parcelSorting, parcelSortingSelection, parcelSortingSelectionDispatch, featureRanges, width, height}) => {
    const p1: ParcelRef | undefined = useMemo(() => (parcelSortingSelection.selectedParcelRefs[0]), [parcelSortingSelection.selectedParcelRefs])
    const p2: ParcelRef | undefined = useMemo(() => (parcelSortingSelection.selectedParcelRefs[1]), [parcelSortingSelection.selectedParcelRefs])

    const {pointGroups, selectedPointGroups, xRange, yRange} = useMemo(() => {
        const pointGroups: PointGroup[] = []
        const selectedPointGroups: string[] = []
        const transform = prepareFeatureTransform({parcelSorting, p1, p2})
        for (let p of [p1, p2]) {
            if (p) {
                const segment = parcelSorting.segments[p.segmentIndex]
                const parcel = segment.parcels[p.parcelIndex]
                const G: PointGroup = {
                    key: parcelRefToString(p),
                    locations: []
                }
                for (let i = 0; i < parcel.features.length; i++) {
                    const a = transform(parcel.features[i])
                    G.locations.push({x: a[0], y: a[1]})
                }
                pointGroups.push(G)
            }
        }
        const xRange = undefined
        const yRange = undefined
        return {pointGroups, selectedPointGroups, xRange, yRange}
    }, [p1, p2, parcelSorting])
    const W = Math.min(width, height)
    const H = W

    if (parcelSortingSelection.selectedParcelRefs.length !== 2) {
        return <div>You must select exactly two parcels for comparison</div>
    }
    return (
        <div>
            <ClusterWidget
                pointGroups={pointGroups}
                selectedPointGroups={selectedPointGroups}
                xRange={xRange}
                yRange={yRange}
                xLabel={"X"}
                yLabel={"Y"}
                width={W}
                height={H}
                pointRadius={3}
            />
        </div>
    )
}

export default ClusterComparisonView