import { CanvasPainter } from "figurl/labbox-react/components/CanvasWidget/CanvasPainter"
import { CanvasWidgetLayer } from "figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer"

type LayerProps = {
    waveform: number[][] // T x M
    maxAmplitude: number
    width: number
    height: number
}

type LayerState = {

}

const initialLayerState = {
}

const onPaint = (painter: CanvasPainter, layerProps: LayerProps, state: LayerState) => {
    const {waveform, maxAmplitude, width, height} = layerProps

    painter.wipe()

    const T = waveform.length
    const M = waveform[0].length

    // let ymin = waveform[0][0]
    // let ymax = waveform[0][0]
    // for (let t=0; t<T; t++) {
    //     for (let m=0; m<M; m++) {
    //         const v = waveform[t][m]
    //         ymin = Math.min(ymin, v)
    //         ymax = Math.max(ymax, v)
    //     }
    // }
    // const ymaxabs = Math.max(Math.abs(ymin), Math.abs(ymax))

    const transform = (t: number, m: number, v: number) => {
        const x = ((t + 0.5) / T) * width
        const y0 = (v + maxAmplitude) / (2 * maxAmplitude) - 0.5
        const y = ((m + 1) / (M + 1)) * height - y0 * (height / M)
        return [x, y]
    }

    for (let m=0; m<M; m++) {
        const path = painter.createPainterPath()
        for (let t=0; t<T; t++) {
            const p = transform(t, m, waveform[t][m])
            path.lineTo(p[0], p[1])
        }
        painter.drawPath(path, {color: 'black'})
    }
}

const onPropsChange = (layer: CanvasWidgetLayer<LayerProps, LayerState>, layerProps: LayerProps) => {
    layer.scheduleRepaint()
}

export const createSpikeWaveformLayer = () => {
    return new CanvasWidgetLayer<LayerProps, LayerState>(
        onPaint,
        onPropsChange,
        initialLayerState
    )
}