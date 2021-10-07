import { funcToTransform } from "figurl/labbox-react/components/CanvasWidget"
import { CanvasPainter } from "figurl/labbox-react/components/CanvasWidget/CanvasPainter"
import { CanvasWidgetLayer, ClickEvent, ClickEventModifiers, ClickEventType, DiscreteMouseEventHandler } from "figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer"
import { Vec2 } from "figurl/labbox-react/components/CanvasWidget/Geometry"
import { PointGroup } from "./ClusterWidget"

export type LayerProps = {
    pointGroups: PointGroup[]
    hoveredPointGroup: string,
    onHoverPointGroup: (key: string) => void,
    onClickPointGroup: (key: string, modifiers: ClickEventModifiers) => void,
    selectedPointGroups: string[]
    xRange: [number, number]
    yRange: [number, number]
    width: number
    height: number
    pointRadius: number
}

type LayerState = {
    markers?: Marker[]
}

const handleHover: DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<LayerProps, LayerState>) => {
    if (event.type !== ClickEventType.Move) return
    const state = layer.getState()
    if (!state.markers) return
    const props = layer.getProps()
    const p = event.point
    for (let marker of state.markers) {
        const p0 = marker.p
        const delta = [p0[0] - p[0], p0[1] - p[1]]
        const dist = Math.sqrt(delta[0] * delta[0] + delta[1] * delta[1])
        if (dist <= props.pointRadius * 3) {
            layer.getProps().onHoverPointGroup(marker.group)
            return
        }
    }
    layer.getProps().onHoverPointGroup('')
}

const handleClick: DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<LayerProps, LayerState>) => {
    if (event.type !== ClickEventType.Release) return
    const props = layer.getProps()
    const g = props.hoveredPointGroup
    props.onClickPointGroup(g, event.modifiers)
}

type Marker = {
    group: string,
    p: Vec2,
    selected: boolean,
    hovered: boolean,
    density: number
}

export const createClusterViewMainLayer = () => {
    const onPaint = (painter: CanvasPainter, props: LayerProps, state: LayerState) => {
        const { pointGroups, selectedPointGroups, hoveredPointGroup, xRange, yRange, width, height, pointRadius } = props
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
        const markers: Marker[] = []
        for (let g = 0; g < pointGroups.length; g++) {
            const G = pointGroups[g]
            const selected = selectedPointGroups.includes(G.key)
            const hovered = G.key === hoveredPointGroup
            for (let i = 0; i < G.locations.length; i++) {
                const {x, y} = G.locations[i]
                markers.push({
                    group: G.key,
                    p: painter2.transformPointToPixels([x, y]),
                    selected,
                    hovered,
                    density: 0
                })
            }
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
        const maxDensity = Math.max(...markers.map(m => (m.density))) + 1
        // all
        for (let marker of markers) {
            const v = marker.density / maxDensity * 255
            const color = `rgb(0, ${v}, ${v})`
            const pen = {color, width: 1}
            const brush = {color}
            painter.drawMarker(
                marker.p,
                {
                    radius: pointRadius,
                    pen,
                    brush
                }
            )
        }
        // selected
        for (let marker of markers.filter(m => (m.selected))) {
            const v = marker.density / maxDensity * 255
            const color = `rgb(200, ${v}, ${v})`
            const pen = {color, width: 1}
            const brush = {color}
            painter.drawMarker(
                marker.p,
                {
                    radius: pointRadius * 2,
                    pen,
                    brush
                }
            )
        }
        // hovered
        for (let marker of markers.filter(m => (m.hovered))) {
            const v = marker.density / maxDensity * 255
            const color = marker.selected ? `rgb(230, ${v}, ${v})` : `rgb(200, 200, ${v})`
            const pen = {color, width: 1}
            const brush = {color}
            painter.drawMarker(
                marker.p,
                {
                    radius: pointRadius * 2,
                    pen,
                    brush
                }
            )
        }
        state.markers = markers
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
            discreteMouseEventHandlers: [handleHover, handleClick]
        }
    )
}