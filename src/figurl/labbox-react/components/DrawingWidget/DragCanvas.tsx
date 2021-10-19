import React, { useMemo, useRef } from "react"
import { getRectFromPointPair, Vec2, Vec4 } from "./Geometry"

// NOTE: Tracks drag state in *pixelspace*.

const dragStyle = 'rgba(196, 196, 196, 0.5)'

export interface DragState {
    isActive: boolean,  // whether we are in an active dragging state
    dragAnchor?: Vec2, // The position where dragging began (pixels)
    dragRect?: Vec4,   // The drag rect. [0],[1] are the upper left corner, [2], [3] are width & height.
    shift?: boolean    // whether the shift key is being pressed
}

export type DragActionType = 'COMPUTE_DRAG' | 'END_DRAG' | 'RESET_DRAG' | 'PARTIAL'

export interface DragAction {
    type: DragActionType, // type of action
    mouseButtonIsDown?: boolean,
    point?: Vec2, // The position (pixels)
    shift?: boolean // Whether shift key is being pressed
}

export const COMPUTE_DRAG: DragActionType = 'COMPUTE_DRAG'
export const END_DRAG: DragActionType = 'END_DRAG'
export const RESET_DRAG: DragActionType = 'RESET_DRAG'
export const INCOMPLETE_ACTION: DragActionType = 'PARTIAL'

export const getDragActionFromEvent = (e: React.MouseEvent): DragAction => {
    const boundingRect = e.currentTarget.getBoundingClientRect()
    const point: Vec2 = [e.clientX - boundingRect.x, e.clientY - boundingRect.y]
    const mouseButtonIsDown = e.buttons === 1
    const shift = e.shiftKey
    return { type: INCOMPLETE_ACTION, mouseButtonIsDown, point, shift }
}

export const dragReducer = (state: DragState, action: DragAction): DragState => {
    const {dragAnchor, dragRect } = state
    const {type, mouseButtonIsDown, point, shift} = action
    const DRAG_START_TOLERANCE = 4
    
    switch (type) {
        case RESET_DRAG:    // should happen on mousedown
            return { isActive: false }
        case END_DRAG:      // should happen on mouseup
            const rect = dragAnchor && point ? getRectFromPointPair(dragAnchor, point) : undefined
            return {  
                isActive: false,
                dragRect: rect,
                shift: shift
            }
        case COMPUTE_DRAG:  // should happen on mouse move
            // Clear the state if the mouse button is up
            // (Any previous state should've already been finalized on the mouse up event itself)
            if (!mouseButtonIsDown) return {
                isActive: false
            }
            if (!point) throw Error('ASSERTION FAILED: COMPUTE_DRAG but the mousemove event had no location.')
            
            // If the drag anchor isn't set, just set it to the current point.
            // If the drag anchor is set, then:
            // - if there's already an active drag, update the drag rectangle.
            // - If there isn't an active drag, start one, IFF the point has moved far enough from the original click.
            return !dragAnchor ?
                {
                    isActive: false,
                    dragAnchor: point
                }
                : dragRect
                    || (Math.abs(point[0] - dragAnchor[0]) > DRAG_START_TOLERANCE)
                    || (Math.abs(point[1] - dragAnchor[1]) > DRAG_START_TOLERANCE) ?
                    {
                        ...state,
                        isActive: true,
                        dragRect: getRectFromPointPair(dragAnchor, point)
                    }
                    : state
        default: {
            throw Error('Invalid mode for drag reducer.')
        }
    }
}

const paintDragRectangle = (canvasRef: React.ForwardedRef<HTMLCanvasElement>, dragState: DragState | undefined) => {
    if (!dragState || !canvasRef) return
    if (typeof canvasRef === 'function') return
    const canvas = canvasRef.current
    const ctxt = canvas && canvas.getContext('2d')
    if (!ctxt) {
        console.log("Unable to get 2d context.")
        return
    }

    ctxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height)
    if (dragState.isActive) {
        const rect = dragState.dragRect || [0, 0, 0, 0]
        ctxt.fillStyle = dragStyle
        ctxt.fillRect(rect[0], rect[1], rect[2], rect[3])
    }
}

interface DragCanvasProps {
    width: number
    height: number
    newState: DragState
}

const DragCanvas = (props: DragCanvasProps) => {
    const { width, height, newState } = props
    const ref = useRef<HTMLCanvasElement | null>(null)

    const canvas = useMemo(() => {
        return <canvas
            ref={ref}
            width={width}
            height={height}
            style={{position: 'absolute', left: 0, top: 0}}
        />
    }, [width, height])
    paintDragRectangle(ref, newState)

    return canvas
}
    
export default DragCanvas
