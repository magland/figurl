import BaseCanvas from 'figurl/labbox-react/components/DrawingWidget/BaseCanvas'
import CanvasFrame from 'figurl/labbox-react/components/DrawingWidget/CanvasFrame'
import DragCanvas, { DragAction, handleMouseDownIfDragging, handleMouseMoveIfDragging, handleMouseUpIfDragging } from 'figurl/labbox-react/components/DrawingWidget/DragCanvas'
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

    const nextDragStateUpdate = useRef<DragAction | null>(null)
    const nextFrame = useRef<number>(0)
    const dragCanvas = disableSelection || <DragCanvas width={width} height={height} newState={state.dragState} />
    
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const wasHandled = handleMouseMoveIfDragging(e, {nextDragStateUpdate, nextFrame, reducer: dispatchState, reducerOtherProps: {type: 'DRAGUPDATE'}})
        if (!wasHandled) {
            const point = getEventPoint(e)
            dispatchState({
                type: 'UPDATEHOVER',
                point: point
            })
        }
    }, [])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        handleMouseDownIfDragging(e, {nextDragStateUpdate, nextFrame, reducer: dispatchState, reducerOtherProps: {type: 'DRAGUPDATE'}})
    }, [])

    const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (state.dragState.isActive) {
            // mouseup with an active drag = end the drag & that's it.
            handleMouseUpIfDragging(e, {nextDragStateUpdate, nextFrame, reducer: dispatchState, reducerOtherProps: {type: 'DRAGUPDATE', selectedElectrodeIds: selectedElectrodeIds}})
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

    const canvas = useMemo(() => {
        const data = {
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
        return <BaseCanvas 
            width={width}
            height={height}
            draw={paint}
            drawData={data}
        />
    }, [width, height, state.convertedElectrodes, selectedElectrodeIds, state.hoveredElectrodeId, state.draggedElectrodeIds, state.pixelRadius, props.showLabels, offsetLabels, props.layoutMode, state.xMarginWidth, colors])

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

    const frame = <CanvasFrame
        width={props.width}
        height={props.height}
        canvases={[dragCanvas, USE_SVG && svg, !USE_SVG && canvas]}
        disableHandlers={disableSelection}
        handlers={editProps}
    />

    // TODO: Think about TimeSeriesWidget.
    return frame
}

export default ElectrodeGeometry
