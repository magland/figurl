import { ParcelSorting } from 'plugins/sortingview/ParcelExplorerPlugin/ParcelExplorerPlugin';
import React, { FunctionComponent, useMemo } from 'react';
import colorForParcelIndex from '../../../colorForParcelIndex';
import { ParcelRef } from '../../../ViewPlugin';
import SpikeWaveform from '../../clusterComparisonPlugin/SpikeWaveformWidget/SpikeWaveform';

type Props = {
    parcelSorting: ParcelSorting
    parcels: ParcelRef[]
    maxAmplitude: number
    width: number
    height: number
}

const AverageWaveformWidget: FunctionComponent<Props> = ({parcelSorting, parcels, maxAmplitude, width, height}) => {
    const waveforms = useMemo(() => {
        return parcels.map(parcel => (computeAverageWaveform(parcelSorting, parcel)))
    }, [parcelSorting, parcels])
    const colors = useMemo(() => {
        return parcels.map(parcel => (colorForParcelIndex(parcel.parcelIndex)))
    }, [parcels])

    return (
        <SpikeWaveform
            waveforms={waveforms}
            colors={colors}
            maxAmplitude={maxAmplitude}
            width={width}
            height={height}
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

const computeAverageWaveform = (parcelSorting: ParcelSorting, parcel: ParcelRef) => {
    const featureComponents = parcelSorting.feature_components
    const segment = parcelSorting.segments[parcel.segmentIndex]
    const pp = segment.parcels[parcel.parcelIndex]
    const feature = meanVector(pp.features)

    const K = featureComponents.length
    const T = featureComponents[0].length
    const M = featureComponents[0][0].length
    const ret: number[][] = []
    for (let t=0; t<T; t++) {
        const a: number[] = []
        for (let m=0; m<M; m++) {
            let b = 0
            for (let k=0; k<K; k++) {
                b += feature[k] * featureComponents[k][t][m]
            }
            a.push(b)
        }
        ret.push(a)
    }
    return ret
}

export default AverageWaveformWidget