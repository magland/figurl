import { ParcelSorting } from 'plugins/sortingview/ParcelExplorerPlugin/ParcelExplorerPlugin';
import React, { FunctionComponent, useMemo } from 'react';
import colorForParcelIndex from '../../../colorForParcelIndex';
import { SpikeEventRef } from '../../../ViewPlugin';
import SpikeWaveform from './SpikeWaveform';

type Props = {
    parcelSorting: ParcelSorting
    spikeEvents: SpikeEventRef[]
    maxAmplitude: number
    width: number
    height: number
}

const SpikeWaveformWidget: FunctionComponent<Props> = ({parcelSorting, spikeEvents, maxAmplitude, width, height}) => {
    const waveforms = useMemo(() => {
        return spikeEvents.map(spikeEvent => (computeSpikeWaveform(parcelSorting, spikeEvent))).filter(w => (w !== undefined)) as number[][][]
    }, [parcelSorting, spikeEvents])
    const colors = useMemo(() => {
        return spikeEvents.map(spikeEvent => (colorForParcelIndex(spikeEvent.parcelIndex)))
    }, [spikeEvents])

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

const computeSpikeWaveform = (parcelSorting: ParcelSorting, spikeEvent: SpikeEventRef) => {
    const featureComponents = parcelSorting.feature_components
    const segment = parcelSorting.segments[spikeEvent.segmentIndex]
    if (!segment) return undefined
    const parcel = segment.parcels[spikeEvent.parcelIndex]
    const feature = parcel.features[spikeEvent.spikeEventIndex]

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

export default SpikeWaveformWidget