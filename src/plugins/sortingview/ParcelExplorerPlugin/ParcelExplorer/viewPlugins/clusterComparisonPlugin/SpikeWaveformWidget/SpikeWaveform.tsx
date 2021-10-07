import CanvasWidget from 'figurl/labbox-react/components/CanvasWidget';
import { useLayer, useLayers } from 'figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer';
import React, { FunctionComponent, useMemo } from 'react';
import { createSpikeWaveformLayer } from './spikeWaveformLayer';

type Props = {
    waveform: number[][] // T x M
    maxAmplitude: number
    width: number
    height: number
}

const SpikeWaveform: FunctionComponent<Props> = ({waveform, maxAmplitude, width, height}) => {
    const layerProps = useMemo(() => ({
        waveform,
        maxAmplitude,
        width,
        height
    }), [waveform, maxAmplitude, width, height])
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