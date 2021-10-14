import NiceTable from 'commonComponents/NiceTable/NiceTable';
import { ParcelSorting } from 'plugins/sortingview/ParcelExplorerPlugin/ParcelExplorerPlugin';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { ParcelRef, parcelRefToString, ParcelSortingSelection, ParcelSortingSelectionDispatch } from '../../ViewPlugin';

type Props = {
    parcelSorting: ParcelSorting
    parcelSortingSelection: ParcelSortingSelection
    parcelSortingSelectionDispatch: ParcelSortingSelectionDispatch
    width: number
    height: number
}

export type MergeCandidate = {
    parcel1: ParcelRef
    parcel2: ParcelRef
}

const useMergeCandidates = (parcelSorting: ParcelSorting, segmentIndex: number): MergeCandidate[] => {
    const distanceMatrix = useMemo(() => {
        const s = parcelSorting.segments[segmentIndex]
        const n = s.parcels.length
        const centroids = []
        for (let i=0; i<n; i++) {
            centroids.push(meanVector(s.parcels[i].features))
        }
        // return computeNormalizedDistanceMatrix(centroids)
        return computeDistanceMatrix(centroids)
    }, [parcelSorting, segmentIndex])
    return useMemo(() => {
        const s = parcelSorting.segments[segmentIndex]
        const n = distanceMatrix.length
        const candidates: {
            i: number,
            j: number,
            distance: number
        }[] = []
        for (let i=0; i<n; i++) {
            if (s.parcels[i].features.length >= 10) {
                for (let j=i+1; j<n; j++) {
                    if (s.parcels[j].features.length >= 10) {
                        candidates.push({i, j, distance: distanceMatrix[i][j]})
                    }
                }
            }
        }
        candidates.sort((c1, c2) => (c1.distance - c2.distance))
        return candidates.slice(0, n * 4).map(c => ({
            parcel1: {segmentIndex, parcelIndex: c.i},
            parcel2: {segmentIndex, parcelIndex: c.j}
        }))
    }, [distanceMatrix, segmentIndex, parcelSorting.segments])
}

const MergeCandidatesTable: FunctionComponent<Props> = ({parcelSorting, parcelSortingSelection, parcelSortingSelectionDispatch, width, height}) => {
    const columns = useMemo(() => ([
        {
            key: 'candidate',
            label: 'Candidate'
        }
    ]), [])

    const segmentIndex = parcelSortingSelection.selectedSegmentIndex

    const mergeCandidates = useMergeCandidates(parcelSorting, segmentIndex)

    const rows = useMemo(() => (
        mergeCandidates.map((mc, ii) => ({
            key: `${ii}`,
            columnValues: {
                candidate: `${parcelRefToString(mc.parcel1)} | ${parcelRefToString(mc.parcel2)}`
            }
        }))
    ), [mergeCandidates])

    const selectedParcelRefs = parcelSortingSelection.selectedParcelRefs

    const selectedRowKeys = useMemo(() => {
        if (selectedParcelRefs.length !== 2) return []
        const p1 = parcelRefToString(selectedParcelRefs[0])
        const p2 = parcelRefToString(selectedParcelRefs[1])
        const ret: string[] = []
        for (let ii=0; ii<mergeCandidates.length; ii++) {
            const mc = mergeCandidates[ii]
            const q1 = parcelRefToString(mc.parcel1)
            const q2 = parcelRefToString(mc.parcel2)
            if (((p1 === q1) && (p2 === q2)) || ((p1 === q2) && (p2 === q1))) {
                ret.push(`${ii}`)
            }
        }
        return ret
    }, [mergeCandidates, selectedParcelRefs])

    const handleChange = useCallback((keys: string[]) => {
        const key = keys[0]
        const mc = mergeCandidates[Number(key)]
        if (!mc) return
        parcelSortingSelectionDispatch({type: 'setSelectedParcels', selectedParcelRefs: [mc.parcel1, mc.parcel2]})
    }, [parcelSortingSelectionDispatch, mergeCandidates])

    return (
        <NiceTable
            rows={rows}
            columns={columns}
            selectionMode="single"
            selectedRowKeys={selectedRowKeys}
            onSelectedRowKeysChanged={handleChange}
        />
    )
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

const zerosVector = (m: number): number[] => {
    const a: number[] = []
    for (let i=0; i<m; i++) a.push(0)
    return a
}

const zerosMatrix = (m: number, n: number): number[][] => {
    const a: number[][] = []
    for (let i=0; i<m; i++) a.push(zerosVector(n))
    return a
}

const computeDistanceMatrix = (vectors: number[][]): number[][] => {
    if (vectors.length === 0) return []
    const n = vectors.length
    const ret = zerosMatrix(n, n)
    for (let i=0; i<n; i++) {
        for (let j=0; j<n; j++) {
            if (j > i) {
                ret[i][j] = vectorDistance(vectors[i], vectors[j])
            }
            else {
                ret[i][j] = ret[j][i]
            }
        }
    }
    return ret
}

// const vectorNorm = (v: number[]) => {
//     const sumsqr = v.map(a => (a * a)).reduce((sum, current) => (sum + current), 0)
//     return Math.sqrt(sumsqr)
// }

// const computeNormalizedDistanceMatrix = (vectors: number[][]): number[][] => {
//     if (vectors.length === 0) return []
//     const n = vectors[0].length
//     const ret = zerosMatrix(n, n)
//     for (let i=0; i<n; i++) {
//         for (let j=0; j<n; j++) {
//             if (j > i) {
//                 ret[i][j] = vectorDistance(vectors[i], vectors[j]) / Math.sqrt(vectorNorm(vectors[i]) * vectorNorm(vectors[j]))
//             }
//             else {
//                 ret[i][j] = ret[j][i]
//             }
//         }
//     }
//     return ret
// }

const vectorDistance = (v1: number[], v2: number[]) => {
    const n = v1.length
    let a = 0
    for (let i=0; i<n; i++) a += (v1[i] - v2[i]) * (v1[i] - v2[i])
    return Math.sqrt(a)
}

export default MergeCandidatesTable