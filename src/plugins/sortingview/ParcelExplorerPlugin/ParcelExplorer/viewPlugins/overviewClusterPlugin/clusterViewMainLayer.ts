import { funcToTransform } from "figurl/labbox-react/components/CanvasWidget"
import { CanvasPainter } from "figurl/labbox-react/components/CanvasWidget/CanvasPainter"
import { CanvasWidgetLayer, ClickEvent, ClickEventModifiers, ClickEventType, DiscreteMouseEventHandler } from "figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer"
import { Vec2 } from "figurl/labbox-react/components/CanvasWidget/Geometry"
import { PointGroup } from "./ClusterWidget"

export type LayerProps = {
    pointGroups: PointGroup[]
    hoveredPointGroup: string,
    onHoverPointGroup?: (key: string) => void
    onClickPointGroup?: (key: string, modifiers: ClickEventModifiers) => void
    onClickPoint?: (p: {pointGroupKey: string, pointIndex: number}) => void
    selectedPointGroups?: string[]
    xRange: [number, number]
    yRange: [number, number]
    width: number
    height: number
    pointRadius: number
    useDensityColor: boolean
}

type LayerState = {
    markers?: Marker[]
    hoveredPoint?: {pointGroupKey: string, pointIndex: number}
}

const initialLayerState = {
}

const handleHover: DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<LayerProps, LayerState>) => {
    if (event.type !== ClickEventType.Move) return
    const state = layer.getState()
    if (!state.markers) return
    const props = layer.getProps()
    let closestMarker: Marker | undefined = undefined
    let closestDist = 0
    if ((props.onHoverPointGroup) || (props.onClickPoint)) {
        const p = event.point
        for (let marker of state.markers) {
            const p0 = marker.p
            const delta = [p0[0] - p[0], p0[1] - p[1]]
            const dist = Math.sqrt(delta[0] * delta[0] + delta[1] * delta[1])
            if (dist <= 25) {
                if ((!closestMarker) || (dist < closestDist)) {
                    closestMarker = marker
                    closestDist = dist
                }
            }
        }
    }
    if (props.onHoverPointGroup) {
        if (closestMarker) {
            props.onHoverPointGroup(closestMarker.group)
        }
        else {
            props.onHoverPointGroup('')
        }
    }
    if (props.onClickPoint) {
        if (closestMarker) {
            state.hoveredPoint = {pointGroupKey: closestMarker.group, pointIndex: closestMarker.pointIndex}
            layer.scheduleRepaint()
        }
    }
}

const handleClick: DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<LayerProps, LayerState>) => {
    if (event.type !== ClickEventType.Release) return
    const props = layer.getProps()
    const state = layer.getState()
    if (props.onClickPointGroup) {
        const g = props.hoveredPointGroup
        props.onClickPointGroup(g, event.modifiers)
    }
    if (props.onClickPoint) {
        const p = state.hoveredPoint
        if (p) {
            props.onClickPoint(p)
        }
    }
}

type Marker = {
    group: string,
    pointIndex: number,
    p: Vec2,
    selected: boolean,
    hovered: boolean,
    density: number
}

export const createClusterViewMainLayer = () => {
    const onPaint = (painter: CanvasPainter, props: LayerProps, state: LayerState) => {
        const { pointGroups, selectedPointGroups, hoveredPointGroup, xRange, yRange, width, height, pointRadius, useDensityColor } = props
        const groupColors: {[key: string]: string} = {}
        for (let G of pointGroups) {
            groupColors[G.key] = G.color
        }
        painter.wipe()
        const transform = funcToTransform((p: Vec2) => {
            const xFrac = (p[0] - xRange[0]) / (xRange[1] - xRange[0])
            const yFrac = (p[1] - yRange[0]) / (yRange[1] - yRange[0])
            return [
                xFrac * width,
                (1 - yFrac) * height
            ]
        })
        const painter2 = painter.transform(transform)

        // draw axes
        painter2.drawLine(xRange[0], 0, xRange[1], 0, {color: 'lightgray', width: 3})
        painter2.drawLine(0, yRange[0], 0, yRange[1], {color: 'lightgray', width: 3})

        const markers: Marker[] = []
        for (let g = 0; g < pointGroups.length; g++) {
            const G = pointGroups[g]
            const selected = (selectedPointGroups || []).includes(G.key)
            const hovered = G.key === hoveredPointGroup
            for (let i = 0; i < G.locations.length; i++) {
                const {x, y} = G.locations[i]
                markers.push({
                    group: G.key,
                    pointIndex: i,
                    p: painter2.transformPointToPixels([x, y]),
                    selected,
                    hovered,
                    density: 0
                })
            }
        }
        markers.sort((a, b) => (a.p[0] - b.p[0]))
        if (useDensityColor) {
            for (let i = 0; i < markers.length; i++) {
                const m1 = markers[i]
                let j = i + 1
                while (j < markers.length) {
                    const m2 = markers[j]
                    const dx = Math.abs(m1.p[0] - m2.p[0])
                    const dy = Math.abs(m1.p[1] - m2.p[1])
                    if ((dx <= props.pointRadius)) {
                        if (dy <= props.pointRadius) {
                            m1.density ++
                            m2.density ++
                        }
                    }
                    else break
                    j++
                }
            }
        }
        const maxDensity = Math.max(...markers.map(m => (m.density))) + 1
        // all
        for (let marker of markers) {
            let color: string
            if (useDensityColor) {
                const v = marker.density / maxDensity * 255
                color = `rgb(0, ${v}, ${v})`
            }
            else {
                color = groupColors[marker.group] || 'black'
            }
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
            const color = groupColors[marker.group] || 'black'
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
        // hovered group
        for (let marker of markers.filter(m => (m.hovered))) {
            const v = marker.density / maxDensity * 255
            const color = useDensityColor ? (marker.selected ? `rgb(230, ${v}, ${v})` : `rgb(200, 200, ${v})`) : `rgb(200, 200, 0)`
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
        if (state.hoveredPoint) {
            for (let marker of markers.filter(m => ((m.group === state.hoveredPoint?.pointGroupKey) && (m.pointIndex === state.hoveredPoint?.pointIndex)))) {
                const color = `rgb(200, 200, 0)`
                const pen = {color, width: 1}
                const brush = {color}
                painter.drawMarker(
                    marker.p,
                    {
                        radius: pointRadius * 3,
                        pen,
                        brush
                    }
                )
            }
        }
        state.markers = markers
    }
    const onPropsChange = (layer: CanvasWidgetLayer<LayerProps, LayerState>, props: LayerProps) => {
        layer.scheduleRepaint()
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