import { funcToTransform } from "figurl/labbox-react/components/CanvasWidget"
import { CanvasPainter } from "figurl/labbox-react/components/CanvasWidget/CanvasPainter"
import { CanvasWidgetLayer } from "figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer"
import { Vec2 } from "figurl/labbox-react/components/CanvasWidget/Geometry"

export type LayerProps = {
    xFeatures: number[]
    yFeatures: number[]
    xRange: [number, number]
    yRange: [number, number]
    width: number
    height: number
}

type LayerState = {

}

export const createClusterViewMainLayer = () => {
    const onPaint = (painter: CanvasPainter, props: LayerProps, state: LayerState) => {
        const { xFeatures, yFeatures, xRange, yRange, width, height } = props
        painter.wipe()
        const T = funcToTransform((p: Vec2) => {
            const xFrac = (p[0] - xRange[0]) / (xRange[1] - xRange[0])
            const yFrac = (p[1] - yRange[0]) / (yRange[1] - yRange[0])
            return [
                xFrac * width,
                yFrac * height
            ]
        })
        const painter2 = painter.transform(T)
        const markers: {
            p: Vec2,
            density: number
        }[] = []
        for (let i = 0; i < xFeatures.length; i++) {
            markers.push({
                p: painter2.transformPointToPixels([xFeatures[i], yFeatures[i]]),
                density: 1
            })
        }
        markers.sort((a, b) => (a.p[0] - b.p[0]))
        for (let i = 0; i < markers.length; i++) {
            const m1 = markers[i]
            let j = i + 1
            while (j < markers.length) {
                const m2 = markers[j]
                const dx = Math.abs(m1.p[0] - m2.p[0])
                const dy = Math.abs(m1.p[1] - m2.p[1])
                if ((dx <= 1)) {
                    if (dy <= 1) {
                        m1.density ++
                        m2.density ++
                    }
                }
                else break
                j++
            }
        }
        const maxDensity = Math.max(...markers.map(m => (m.density)))
        for (let marker of markers) {
            const v = marker.density / maxDensity * 255
            const color = `rgb(${v}, ${v}, 0)`
            const pen = {color, width: 1}
            const brush = {color}
            painter.drawMarker(
                marker.p,
                {
                    radius: 1,
                    pen,
                    brush
                }
            )
        }
    }
    const onPropsChange = (layer: CanvasWidgetLayer<LayerProps, LayerState>, props: LayerProps) => {
        layer.scheduleRepaint()
    }
    const initialLayerState = {
    }
    return new CanvasWidgetLayer<LayerProps, LayerState>(
        onPaint,
        onPropsChange,
        initialLayerState,
        {
        }
    )
}