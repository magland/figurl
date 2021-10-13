import { CanvasWidgetLayer, KeyboardEvent, KeyboardEventHandler, KeypressMap } from 'figurl/labbox-react/components/CanvasWidget'
import { CanvasPainter, PainterPath } from 'figurl/labbox-react/components/CanvasWidget/CanvasPainter'
import { TransformationMatrix } from 'figurl/labbox-react/components/CanvasWidget/Geometry'
import { ElectrodeBox } from '../../common/sharedCanvasLayers/setupElectrodes'

export type WaveformLayerProps = {
    keypressMap?: KeypressMap
    electrodeBoxes: ElectrodeBox[]
    paths: PainterPath[]
    transform: TransformationMatrix
    waveform?: number[][]
    waveformOpts: {
        colors?: WaveformColors
        waveformWidth: number
    }
    width: number       // unused but required for a LayerProps
    height: number      // unused but required for a LayerProps
}

export type WaveformColors = {
    base: string
}
const defaultWaveformColors: WaveformColors = {
    base: 'black'
}
type LayerState = {
    electrodeBoxes: ElectrodeBox[],
}
const initialLayerState = {
    electrodeBoxes: []
}

// If any custom actions have been set (that is, something a user of this component wants to happen in response to a key press)
// expect them to have been passed in with the key 'customActions' & call them here.
export const handleKeyboardEvent: KeyboardEventHandler = (e: KeyboardEvent, layer: CanvasWidgetLayer<WaveformLayerProps, LayerState>): boolean => {
    console.log(`Got keystroke: ${e.key}`) // This never actually triggers--keystrokes aren't getting through to the canvas layer
    const props = layer.getProps()
    if (!props || !props.keypressMap) return true
    if (e.key in props.keypressMap) {
        // props.keypressMap[e.key]()
        return false
    }
    return true
}

export const createWaveformLayer = () => {
    const onPaint = (painter: CanvasPainter, props: WaveformLayerProps, state: LayerState) => {
        const { waveformOpts, paths, electrodeBoxes } = props
        if (!paths || paths.length === 0) return
        console.log(`Painting waveform @${Date.now()}`)
        const colors = waveformOpts?.colors || defaultWaveformColors
        // const maxAbs = Math.max(...waveform.map(w => Math.max(...w.map(x => Math.abs(x)))))
        painter.wipe()
        for (let i = 0; i < electrodeBoxes.length; i++) {
            const e = electrodeBoxes[i]
            const painter2 = painter.transform(e.transform)
            // const path = painter2.createPainterPath()
            // for (let j = 0; j < waveform[i].length; j ++) {
            //     path.lineTo(j, waveform[i][j])
            // }
            painter2.drawPath(paths[i], {color: colors.base, width: waveformOpts?.waveformWidth})
        }
    }
    const onPropsChange = (layer: CanvasWidgetLayer<WaveformLayerProps, LayerState>, props: WaveformLayerProps) => {
        // const { width, height, electrodeLocations, electrodeIds } = props
        // const { electrodeBoxes, transform } = setupElectrodes({width, height, electrodeLocations, electrodeIds, layoutMode: props.layoutMode, maxElectrodePixelRadius: props.electrodeOpts.maxElectrodePixelRadius})
        const { electrodeBoxes, transform } = {...props}
        layer.setTransformMatrix(transform)
        layer.setState({electrodeBoxes})
        layer.scheduleRepaint()
    }
    return new CanvasWidgetLayer<WaveformLayerProps, LayerState>(
        onPaint,
        onPropsChange,
        initialLayerState,
        {
            keyboardEventHandlers: [handleKeyboardEvent]
        }
    )
}