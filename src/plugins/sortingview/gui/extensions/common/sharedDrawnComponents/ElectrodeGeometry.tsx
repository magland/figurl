import DragCanvas, { COMPUTE_DRAG, DragAction, END_DRAG, getDragActionFromEvent, RESET_DRAG } from 'figurl/labbox-react/components/DrawingWidget/DragCanvas'
import { TransformationMatrix, Vec2 } from 'figurl/labbox-react/components/DrawingWidget/Geometry'
import { RecordingSelectionDispatch } from "plugins/sortingview/gui/pluginInterface"
import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { defaultColors, ElectrodeColors, paint } from './electrodeGeometryPainting'
import { ElectrodeGeometryActionType, electrodeGeometryReducer } from './electrodeGeometryStateManagement'
import SvgElectrodeLayout from './ElectrodeGeometrySvg'

const USE_SVG = false

export const defaultMaxPixelRadius = 25

export type Electrode = {
    id: number
    label: string
    x: number
    y: number
}

export type PixelSpaceElectrode = {
    e: Electrode
    pixelX: number
    pixelY: number
    transform: TransformationMatrix // Dunno if we really need this?
}

export type LayoutMode = 'geom' | 'vertical'

interface WidgetProps {
    electrodes: Electrode[],
    selectedElectrodeIds: number[]
    selectionDispatch: RecordingSelectionDispatch
    width: number
    height: number
    colors?: ElectrodeColors
    layoutMode?: 'geom' | 'vertical'
    showLabels?: boolean
    maxElectrodePixelRadius?: number
    offsetLabels?: boolean
    disableSelection?: boolean
}

const defaultElectrodeLayerProps = {
    showLabels: true,
    maxElectrodePixelRadius: defaultMaxPixelRadius
}


const getEventPoint = (e: React.MouseEvent) => {
    const boundingRect = e.currentTarget.getBoundingClientRect()
    const point: Vec2 = [e.clientX - boundingRect.x, e.clientY - boundingRect.y]
    return point
}

const ElectrodeGeometry = (props: WidgetProps) => {
    const { width, height, electrodes, selectedElectrodeIds, selectionDispatch } = props
    const disableSelection = props.disableSelection ?? false
    const offsetLabels = props.offsetLabels ?? false
    const colors = props.colors ?? defaultColors
    const layoutMode: LayoutMode = props.layoutMode ?? 'geom'
    const maxElectrodePixelRadius = props.maxElectrodePixelRadius || defaultElectrodeLayerProps.maxElectrodePixelRadius
    const [state, dispatchState] = useReducer(electrodeGeometryReducer, {
            convertedElectrodes: [],
            pixelRadius: -1,
            draggedElectrodeIds: [],
            pendingSelectedElectrodeIds: selectedElectrodeIds,
            dragState: {isActive: false},
            xMarginWidth: -1
        })

    useEffect(() => {
        const type: ElectrodeGeometryActionType = 'INITIALIZE'
        const a = {
            type: type,
            electrodes: electrodes,
            width: width,
            height: height,
            maxElectrodePixelRadius: maxElectrodePixelRadius,
            layoutMode: layoutMode
        }
        dispatchState(a)
    }, [width, height, electrodes, layoutMode, maxElectrodePixelRadius])

    // Call to update selected electrode IDs if our opinion differs from the one that was passed in
    // (but only if our opinion has changed)
    useEffect(() => {
        selectionDispatch({type: 'SetSelectedElectrodeIds', selectedElectrodeIds: state.pendingSelectedElectrodeIds})
    }, [selectionDispatch, state.pendingSelectedElectrodeIds])

    const dragCanvas = disableSelection || <DragCanvas width={width} height={height} newState={state.dragState} />

    const nextDragStateUpdate = useRef<DragAction | null>(null)
    const nextFrame = useRef<number>(0)

    // This function debounces drag state updates.
    // It uses requestAnimationFrame() to schedule updates at an appropriate rate.
    // When the timer is up, if there's no pending update, it cancels the cycle.
    // However, if there is a pending update, it applies the update & sets another timer.
    const updateDragState = useCallback(() => {
        if (nextDragStateUpdate.current === null) {
            window.cancelAnimationFrame(nextFrame.current)
            nextFrame.current = 0
        } else {
            dispatchState({
                type: 'DRAGUPDATE',
                dragAction: nextDragStateUpdate.current,
                selectedElectrodeIds: selectedElectrodeIds
            })
            nextFrame.current = requestAnimationFrame(updateDragState)
        }
        nextDragStateUpdate.current = null
    }, [nextDragStateUpdate, nextFrame, dispatchState, selectedElectrodeIds])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const action: DragAction = {
            ...getDragActionFromEvent(e),
            type: COMPUTE_DRAG
        }
        // with mouse button down, this is a drag situation.
        // But we debounce drag-state updates. So check if we're in the cooldown between updates.
        // If an update is pending, tell it to apply the new change; otherwise, schedule an update.
        if (action.mouseButtonIsDown) {
            nextDragStateUpdate.current = action
            if (nextFrame.current === 0) {
                updateDragState()
            }
        } else { // if mouse button up, don't dispatch a drag action, but maybe update hover status.
            const point = getEventPoint(e)
            dispatchState({
                type: 'UPDATEHOVER',
                point: point
            })
        }
    }, [nextDragStateUpdate, nextFrame, updateDragState])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        nextDragStateUpdate.current = null
        dispatchState({
            type: 'DRAGUPDATE',
            dragAction: {type: RESET_DRAG},
            selectedElectrodeIds: [] // we won't actually use these for this, so reduce the dependencies.
        })
    }, [nextDragStateUpdate, dispatchState])

    const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (state.dragState.isActive) {
            // if we have an active drag and we get a mouse up, that should end the drag & that's it.
            nextDragStateUpdate.current = null
            dispatchState({
                type: 'DRAGUPDATE',
                dragAction: { ...getDragActionFromEvent(e), type: END_DRAG },
                selectedElectrodeIds: selectedElectrodeIds
            })
        } else {
            // if there was no active drag, then the mouseup is a click. Treat it as such.
            const point = getEventPoint(e)
            dispatchState({
                type: 'UPDATECLICK',
                point: point,
                shift: e.shiftKey,
                ctrl: e.ctrlKey,
                selectedElectrodeIds: selectedElectrodeIds
            })
        }
    }, [state.dragState.isActive, selectedElectrodeIds])

    useEffect(() => {
        const paintProps = {
            pixelElectrodes: state.convertedElectrodes,
            selectedElectrodeIds: selectedElectrodeIds,
            hoveredElectrodeId: state.hoveredElectrodeId,
            draggedElectrodeIds: state.draggedElectrodeIds,
            pixelRadius: state.pixelRadius,
            showLabels: props.showLabels ?? defaultElectrodeLayerProps.showLabels,
            offsetLabels: offsetLabels,
            layoutMode: props.layoutMode ?? 'geom',
            xMargin: state.xMarginWidth,
            colors: colors
        }
        paint(canvasRef, paintProps)
    }, [state.convertedElectrodes, selectedElectrodeIds, state.hoveredElectrodeId, state.draggedElectrodeIds, state.pixelRadius, props.showLabels, offsetLabels, props.layoutMode, state.xMarginWidth, colors])

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const canvas = useMemo(() => {
        return <canvas 
            ref={canvasRef}
            width={width}
            height={height}
            style={{position: 'absolute', left: 0, top: 0}}
        />
    }, [width, height])

    const svg = useMemo(() => {
        return USE_SVG && <SvgElectrodeLayout 
            pixelElectrodes={state.convertedElectrodes}
            selectedElectrodeIds={selectedElectrodeIds}
            hoveredElectrodeId={state.hoveredElectrodeId}
            draggedElectrodeIds={state.draggedElectrodeIds}
            pixelRadius={state.pixelRadius}
            showLabels={props.showLabels ?? defaultElectrodeLayerProps.showLabels}
            offsetLabels={offsetLabels}
            layoutMode={props.layoutMode ?? 'geom'}
            xMargin={state.xMarginWidth}
            width={width}
            height={height}
            colors={colors}
        />
    }, [state.convertedElectrodes, selectedElectrodeIds, state.hoveredElectrodeId, state.draggedElectrodeIds, state.pixelRadius, props.showLabels, offsetLabels, props.layoutMode, state.xMarginWidth, width, height, colors])

    const editProps = {
        onMouseMove: (e: any) => handleMouseMove(e),
        onMouseUp: (e: any) => handleMouseUp(e),
        onMouseDown: (e: any) => handleMouseDown(e)
    }

    // ENCAPSULATE PARENT DIV STYLING --> maybe add a React component that defines these by default?
    // --> For greater composability? (Follow up this thought)
    // TODO: Avoid boilerplate to get a context from a canvasref (functionalize)
    // TODO: Revisit the idea of encapsulating canvas in a useCanvas hook/ CanvasDiv
    // TODO: Make a Hello World example to show usage.
    // TODO: Library functions?
    // TODO: Think about TimeSeriesWidget.
    // TODO: There's still more that could be done to make the drag canvas/drag functionality more encapsulated.
    return <div
        style={{
            width: props.width,
            height: props.height,
            position: 'relative',
            left: 0,
            top: 0
        }}
        {...(disableSelection || {...editProps})}
    >
        {dragCanvas}
        {USE_SVG && svg}
        {!USE_SVG && canvas}
    </div>
}

export default ElectrodeGeometry
