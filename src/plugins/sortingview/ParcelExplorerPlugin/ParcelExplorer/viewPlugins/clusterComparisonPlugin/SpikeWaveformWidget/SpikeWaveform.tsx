import CanvasWidget from 'figurl/labbox-react/components/CanvasWidget';
import { useLayer, useLayers } from 'figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer';
import React, { FunctionComponent, useMemo } from 'react';
import { createSpikeWaveformLayer } from './spikeWaveformLayer';

type Props = {
    waveforms: number[][][] // L x T x M
    colors: string[] // L
    maxAmplitude: number
    width: number
    height: number
}

const SpikeWaveform: FunctionComponent<Props> = ({waveforms, colors, maxAmplitude, width, height}) => {
    const layerProps = useMemo(() => ({
        waveforms,
        colors,
        maxAmplitude,
        width,
        height
    }), [waveforms, colors, maxAmplitude, width, height])
    const layer = useLayer(createSpikeWaveformLayer, layerProps)
    const layers = useLayers([layer])
    return (
        <CanvasWidget
            layers={layers}
            width={width}
            height={height}
        />
    )
}

export default SpikeWaveform