import DragCanvas, { DragState } from 'figurl/labbox-react/components/DrawingWidget/DragCanvas'
// import { DragState } from 'figurl/labbox-react/components/DrawingWidget/DragCanvas'
// import DragLayer from 'figurl/labbox-react/components/DrawingWidget/DragLayer'
import { pointSpanToRegion, Vec2 } from 'figurl/labbox-react/components/DrawingWidget/Geometry'
import { copyMouseEvent } from 'figurl/labbox-react/components/DrawingWidget/utility'
import { RecordingSelectionDispatch } from "plugins/sortingview/gui/pluginInterface"
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { computeElectrodeLocations, getDraggedElectrodeIds, getElectrodeAtPoint } from "./electrodeGeometryLogic"
import { paint } from './electrodeGeometryPainting'

export type Electrode = {
    id: number
    label: string
    x: number
    y: number
}

interface WidgetProps {
    electrodes: Electrode[],
    selectedElectrodeIds: number[]
    selectionDispatch: RecordingSelectionDispatch
    width: number
    height: number
    layoutMode?: 'geom' | 'vertical'
    showLabels?: boolean
    maxElectrodePixelRadius?: number
}

const defaultElectrodeLayerProps = {
    showLabels: true,
    maxElectrodePixelRadius: 25
}


const getEventPoint = (e: React.MouseEvent) => {
    const boundingRect = e.currentTarget.getBoundingClientRect()
    const point: Vec2 = [e.clientX - boundingRect.x, e.clientY - boundingRect.y]
    return point
}

const ElectrodeGeometry = (props: WidgetProps) => {
    const { width, height, electrodes, selectedElectrodeIds, selectionDispatch } = props
    const layoutMode = 'geom'
    const maxElectrodePixelRadius = props.maxElectrodePixelRadius || defaultElectrodeLayerProps.maxElectrodePixelRadius
    const [draggedElectrodeIds, setDraggedElectrodeIds] = useState<number[]>([])
    const [hoveredElectrodeId, setHoveredElectrodeId] = useState<number | undefined>(undefined)

    const { convertedElectrodes, pixelRadius } = useMemo(() => {
        return computeElectrodeLocations(width, height, electrodes, layoutMode, maxElectrodePixelRadius)
    }, [width, height, electrodes, layoutMode, maxElectrodePixelRadius])

    const [dragState, setDragState] = useState<DragState>({isFinal: true})
    const dragCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const dragCanvas = <DragCanvas ref={dragCanvasRef} width={width} height={height} onDragStateChanged={setDragState} />

    useEffect(() => {
        setDraggedElectrodeIds([])
        if (!dragState || !dragState.isFinal) return // don't deselect everything if we just started a drag

        console.log(`Drag state finality changed. Now ${JSON.stringify(dragState)}`)
        const currentSelected = dragState?.shift ? selectedElectrodeIds : []
        const dragRectAsMaxMin = pointSpanToRegion(dragState?.dragRect || [0, 0, 0, 0])
        const dragSelected = getDraggedElectrodeIds(convertedElectrodes, dragRectAsMaxMin, pixelRadius)
        selectionDispatch({type: 'SetSelectedElectrodeIds', selectedElectrodeIds: [...currentSelected, ...dragSelected]})
        // This should only fire on drag release, and intentionally is not listing other dependencies.
        // (we don't want to be firing selection logic based on drag state every time the selection changes without a drag state change.)
    }, [dragState?.isFinal, convertedElectrodes, pixelRadius, selectionDispatch])

    useEffect(() => {
        const dragRectAsMaxMin = pointSpanToRegion(dragState?.dragRect || [0, 0, 0, 0])
        const newElectrodeIds = getDraggedElectrodeIds(convertedElectrodes, dragRectAsMaxMin, pixelRadius)
        if (newElectrodeIds.length !== draggedElectrodeIds.length
                || newElectrodeIds.filter(id => !draggedElectrodeIds.includes(id)).length > 0) {
            setDraggedElectrodeIds(newElectrodeIds)
        }
    }, [dragState?.dragRect, convertedElectrodes, draggedElectrodeIds, pixelRadius])

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const eventCopy = copyMouseEvent(e)
        dragCanvasRef.current?.dispatchEvent(eventCopy)
        const point = getEventPoint(e)
        // Hovering doesn't count if we're dragging
        const newHovered = e.buttons === 1 ? undefined : getElectrodeAtPoint(convertedElectrodes, pixelRadius, point)
        if (newHovered !== hoveredElectrodeId) setHoveredElectrodeId(newHovered)
    }, [convertedElectrodes, pixelRadius, hoveredElectrodeId, setHoveredElectrodeId])

    const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const point = getEventPoint(e)
        // To play nicely with dragstate, we need to abort any other action & let dragstate handle it
        // if there is an active dragstate already.
        // NB There is probably a neater way to do this without creating a race condition in the
        // state of the selected electrode ids.
        if (!dragState.isFinal) {
            console.log(`This ends a drag state.`)
            // a non-final dragState means there's an active drag that this mouseup will end.
            // in that case, just dispatch the event to the drag layer.
            dragCanvasRef.current?.dispatchEvent(copyMouseEvent(e))
        } else { // dragState is final before processing the event, i.e. not dragging.
            const clickedId = getElectrodeAtPoint(convertedElectrodes, pixelRadius, point)
            console.log(`got click on ${clickedId} with shift? ${e.shiftKey} ctrl? ${e.ctrlKey}`)
            console.log(`Currently selected: ${selectedElectrodeIds}`)
            if (clickedId === 0 || clickedId === undefined) {
                if (!(e.shiftKey || e.ctrlKey) && selectedElectrodeIds.length > 0) {
                    selectionDispatch({type: 'SetSelectedElectrodeIds', selectedElectrodeIds: []})
                }
                return
            } else {
                // Something was clicked. How it's handled depends on the modifier keys.
                const newSelection = e.ctrlKey  // ctrl-click means toggle state of target electrode
                    ? selectedElectrodeIds.includes(clickedId)
                        ? selectedElectrodeIds.filter(id => id !== clickedId)
                        : [...selectedElectrodeIds, clickedId]
                    : e.shiftKey
                        ? [...selectedElectrodeIds, clickedId] // shift-click: add new item to selection
                        : [clickedId] // unmodified click: set selection to target only
                selectionDispatch({type: 'SetSelectedElectrodeIds', selectedElectrodeIds: newSelection})
            }
        }
    }, [dragState.isFinal, convertedElectrodes, pixelRadius, selectedElectrodeIds, selectionDispatch])

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        dragCanvasRef.current?.dispatchEvent(copyMouseEvent(e))
    }, [])

    useEffect(() => {
        console.log('Calling main paint call.')
        const paintProps = {
            pixelElectrodes: convertedElectrodes,
            selectedElectrodeIds: selectedElectrodeIds,
            hoveredElectrodeId: hoveredElectrodeId,
            draggedElectrodeIds: draggedElectrodeIds,
            pixelRadius: pixelRadius,
            showLabels: props.showLabels ?? defaultElectrodeLayerProps.showLabels,
            offsetLabels: false, // TODO
            layoutMode: props.layoutMode ?? 'geom'
        }
        paint(canvasRef, paintProps)
    }, [convertedElectrodes, selectedElectrodeIds, hoveredElectrodeId, draggedElectrodeIds, pixelRadius, props.showLabels, props.layoutMode])

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const canvas = useMemo(() => {
        return <canvas 
            ref={canvasRef}
            width={width}
            height={height}
            style={{position: 'absolute', left: 0, top: 0}}
        />
    }, [canvasRef, width, height])

    return <div
        style={{
            width: props.width,
            height: props.height,
            position: 'relative',
            left: 0,
            top: 0
        }}
        onMouseMove={(e) => handleMouseMove(e)}
        onMouseUp={(e) => handleMouseUp(e)}
        onMouseDown={(e) => handleMouseDown(e)}
    >
        {canvas}
        {dragCanvas}
    </div>
}

export default ElectrodeGeometry