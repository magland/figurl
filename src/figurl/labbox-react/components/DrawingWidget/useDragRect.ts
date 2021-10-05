import React, { useCallback, useReducer, useRef } from "react"
import { Vec2, Vec4 } from "./Geometry"

// THIS WAS NOT THE SOLUTION

// NOTE: This is written to track drag state in *pixelspace*.

type DragActionType = 'COMPUTE_DRAG' | 'END_DRAG' | 'RESET_DRAG' | 'PARTIAL'

export interface DragState {
    isFinal: boolean, // whether we are in an active dragging state
    dragAnchor?: Vec2, // The position where dragging began (pixels)
    dragRect?: Vec4, // The drag rect for convenience (pixels)
    shift?: boolean // whether the shift keys is being pressed
}

interface DragAction {
    type: DragActionType, // type of action
    mouseButtonIsDown?: boolean,
    point?: Vec2, // The position (pixels)
    shift?: boolean // Whether shift key is being pressed
}


const COMPUTE_DRAG: DragActionType = 'COMPUTE_DRAG'
const END_DRAG: DragActionType = 'END_DRAG'
const RESET_DRAG: DragActionType = 'RESET_DRAG'
const INCOMPLETE_ACTION: DragActionType = 'PARTIAL'

// Find the rectangle identified by 2 points, then return 4 numbers
// representing [x, y, width, height]
// where x & y are the upper left point of the rectangle
// & width and height are positive.
const getRect = (pointA: Vec2, pointB: Vec2): Vec4 => {
    return [
        Math.min(pointA[0], pointB[0]),
        Math.min(pointA[1], pointB[1]),
        Math.abs(pointA[0] - pointB[0]),
        Math.abs(pointA[1] - pointB[1])
    ]
}

const getActionFromEvent = (e: React.MouseEvent): DragAction => {
    const boundingRect = e.currentTarget.getBoundingClientRect()
    const point: Vec2 = [e.clientX - boundingRect.x, e.clientY - boundingRect.y]
    const mouseButtonIsDown = e.buttons === 1
    const shift = e.shiftKey
    console.log(`Returning action: type ${INCOMPLETE_ACTION}, button down ${mouseButtonIsDown}, point ${point}, shift ${shift}`)
    return { type: INCOMPLETE_ACTION, mouseButtonIsDown, point, shift }
}

const dragReducer = (state: DragState, action: DragAction): DragState => {
    const {dragAnchor, dragRect } = state
    const {type, mouseButtonIsDown, point, shift} = action
    const DRAG_START_TOLERANCE = 4

    switch (type) {
        case RESET_DRAG:    // should happen on mousedown
            return { isFinal: true }
        case END_DRAG:      // should happen on mouseup
            const rect = dragAnchor && point ? getRect(dragAnchor, point) : undefined
            return {  
                isFinal: true,
                dragRect: rect,
                shift: shift
            }
        case COMPUTE_DRAG:  // should happen on mouse move
            // Clear the state if the mouse button is up
            // (Any previous state should've already been finalized on the mouse up event itself)
            if (!mouseButtonIsDown) return {
                isFinal: true
            }
            if (!point) throw Error('ASSERTION FAILED: COMPUTE_DRAG but the mousemove event had no location.')
            
            // If the drag anchor isn't set, just set it to the current point.
            // If the drag anchor is set, then:
            // - if there's already an active drag, update the drag rectangle.
            // - If there isn't an active drag, start one, IFF the point has moved far enough from the original click.
            return !dragAnchor ?
                {
                    isFinal: false,
                    dragAnchor: point
                }
                // If anchor is set, update the rect if a) we're already dragging or b) we passed the threshold.
                : dragRect
                    || (Math.abs(point[0] - dragAnchor[0]) > DRAG_START_TOLERANCE)
                    || (Math.abs(point[1] - dragAnchor[1]) > DRAG_START_TOLERANCE) ?
                    {
                        ...state,
                        dragRect: getRect(dragAnchor, point)
                    }
                    : state
        default: {
            throw Error('Invalid mode for drag reducer.')
        }
    }
}

const useDragRect = () => {
    const [state, dispatchDrag] = useReducer(dragReducer, {isFinal: true})
    const nextDragStateUpdate = useRef<DragAction | null>(null)

    const applyPendingDragUpdate = useCallback(() => {
        const updateToApply = nextDragStateUpdate.current
        console.log(`******* UPDATE TO APPLY: ${JSON.stringify(updateToApply)}`)
        console.log(`Ought to now apply ${JSON.stringify(updateToApply)}`)
        nextDragStateUpdate.current = null
        updateToApply && dispatchDrag(updateToApply)
    }, [nextDragStateUpdate, dispatchDrag])
    const debouncedUpdateDrag = useCallback((a: DragAction) => {
        const needToScheduleUpdateExecution = nextDragStateUpdate.current === null
        console.log(`Debouncing. nextDragStateUpdate = ${nextDragStateUpdate} Apply? ${needToScheduleUpdateExecution}`)
        nextDragStateUpdate.current = a
        if (needToScheduleUpdateExecution) {
            setTimeout(() => applyPendingDragUpdate, 30)
        } 
    }, [nextDragStateUpdate, applyPendingDragUpdate])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (e.buttons !== 1) return
        const action: DragAction = {
            ...getActionFromEvent(e),
            type: COMPUTE_DRAG
        }
    //     debouncedUpdateDrag(action)
    // }, [debouncedUpdateDrag])
        dispatchDrag(action)
    }, [dispatchDrag])

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        nextDragStateUpdate.current = null
        dispatchDrag({ ...getActionFromEvent(e), type: END_DRAG })
    }, [nextDragStateUpdate, dispatchDrag])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        nextDragStateUpdate.current = null
        dispatchDrag({ type: RESET_DRAG })
    }, [])

    return {
        moveHandler: handleMouseMove,
        upHandler: handleMouseUp,
        downHandler: handleMouseDown,
        state: state
    }
}

export default useDragRect
