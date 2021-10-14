import { funcToTransform } from "figurl/labbox-react/components/CanvasWidget"
import { CanvasPainter } from "figurl/labbox-react/components/CanvasWidget/CanvasPainter"
import { CanvasDragEvent, CanvasWidgetLayer, DragHandler } from "figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer"
import { getInverseTransformationMatrix, TransformationMatrix, transformRect, Vec2 } from "figurl/labbox-react/components/CanvasWidget/Geometry"

export type LayerProps = {
    onSelectRect: (r: {xmin: number, xmax: number, ymin: number, ymax: number}) => void
    xRange: [number, number]
    yRange: [number, number]
    width: number
    height: number
}

type LayerState = {
    dragRect?: {xmin: number, xmax: number, ymin: number, ymax: number}
    transform?: TransformationMatrix
}

const initialLayerState = {
}

const handleDragSelect: DragHandler = (layer: CanvasWidgetLayer<LayerProps, LayerState>, drag: CanvasDragEvent) => {
    const props = layer.getProps()
    const state = layer.getState()
    if (drag.released) {
        if (state.dragRect) {
            props.onSelectRect(state.dragRect)
        }
        state.dragRect = undefined
        layer.scheduleRepaint()
    }
    else {
        if (!state.transform) return
        const T = getInverseTransformationMatrix(state.transform)
        state.dragRect = transformRect(T, drag.dragRect)
        layer.scheduleRepaint()
    }
}

export const createClusterViewSelectLayer = () => {
    const onPaint = (painter: CanvasPainter, props: LayerProps, state: LayerState) => {
        const { xRange, yRange, width, height } = props
        const { dragRect } = state
        painter.wipe()
        const transform = funcToTransform((p: Vec2) => {
            const xFrac = (p[0] - xRange[0]) / (xRange[1] - xRange[0])
            const yFrac = (p[1] - yRange[0]) / (yRange[1] - yRange[0])
            return [
                xFrac * width,
                (1 - yFrac) * height
            ]
        })
        state.transform = transform
        const painter2 = painter.transform(transform)

        if (dragRect) {
            painter2.fillRect(dragRect, {color: 'lightgray'})
        }
    }
    const onPropsChange = (layer: CanvasWidgetLayer<LayerProps, LayerState>, props: LayerProps) => {
        layer.scheduleRepaint()
    }
    return new CanvasWidgetLayer<LayerProps, LayerState>(
        onPaint,
        onPropsChange,
        initialLayerState,
        {
            dragHandlers: [handleDragSelect]
        }
    )
}