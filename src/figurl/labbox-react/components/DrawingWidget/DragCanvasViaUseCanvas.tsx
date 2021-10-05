import React, { useCallback, useEffect, useMemo, useReducer, useRef } from "react"
import { Vec2, Vec4 } from "./Geometry"
// import useCanvas from './useCanvas'

// THIS IS DEFUNCT.

// NOTE: Tracks drag state in *pixelspace*.

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
    return { type: INCOMPLETE_ACTION, mouseButtonIsDown, point, shift }
}

const dragReducer = (state: DragState, action: DragAction): DragState => {
    const {dragAnchor, dragRect } = state
    const {type, mouseButtonIsDown, point, shift} = action
    const DRAG_START_TOLERANCE = 4
    
    console.log(`Applying new drag action ${JSON.stringify(action)} to state ${JSON.stringify(state)}`)

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

interface MyProps {
    width: number
    height: number
    onDragStateChanged: (newState: DragState) => void
}

const dragStyle = 'rgba(196, 196, 196, 0.5)'

// const paintCanvas = (canvasRef: React.ForwardedRef<HTMLCanvasElement>, dragState: DragState | undefined) => {
//     if (!dragState || !canvasRef) return
//     if (typeof canvasRef === 'function') return
//     const canvas = canvasRef.current
//     const ctxt = canvas && canvas.getContext('2d')
//     if (!ctxt) {
//         console.log("Unable to get 2d context.")
//         return
//     }

//     ctxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height)
//     if (!dragState.isFinal) {
//         const rect = dragState.dragRect || [0, 0, 0, 0]
//         ctxt.fillStyle = dragStyle
//         ctxt.fillRect(rect[0], rect[1], rect[2], rect[3])
//     }
// }

const paintCanvas = (context: CanvasRenderingContext2D, props: {dragState: DragState}) => {
    if (!context || !props.dragState) return
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    if (!props.dragState.isFinal) {
        const rect = props.dragState.dragRect || [0, 0, 0, 0]
        context.fillStyle = dragStyle
        context.fillRect(rect[0], rect[1], rect[2], rect[3])
    }
}

// DO SOME STUFF HERE

const DragCanvas = React.forwardRef<HTMLCanvasElement, MyProps>((props: MyProps, ref) => {
    const { width, height, onDragStateChanged } = props
    const [state, dispatchDrag] = useReducer(dragReducer, {isFinal: true})

    const nextDragStateUpdate = useRef<DragAction | null>(null)
    const nextFrame = useRef<number>(0)

    useEffect(() => {
        // paintCanvas(ref, state)
        onDragStateChanged(state)
    }, [ref, state, onDragStateChanged])

    const updateState = useCallback(() => {
        console.log(`Updating state: ${Date.now()}`)
        if (nextDragStateUpdate.current === null) {
            window.cancelAnimationFrame(nextFrame.current)
            nextFrame.current = 0
        } else {
            dispatchDrag(nextDragStateUpdate.current)
            nextFrame.current = requestAnimationFrame(updateState)
        }
        nextDragStateUpdate.current = null
    }, [nextDragStateUpdate, nextFrame, dispatchDrag])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const action: DragAction = {
            ...getActionFromEvent(e),
            type: COMPUTE_DRAG
        }
        if (state.isFinal && !action.mouseButtonIsDown) return
        nextDragStateUpdate.current = action
        if (nextFrame.current === 0) {
            updateState()
        }
    }, [state, nextDragStateUpdate, nextFrame, updateState])

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        nextDragStateUpdate.current = null
        dispatchDrag({ ...getActionFromEvent(e), type: END_DRAG })
    }, [nextDragStateUpdate, dispatchDrag])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        nextDragStateUpdate.current = null
        dispatchDrag({ type: RESET_DRAG })
    }, [])

    // const canvasRef = useCanvas({draw: paintCanvas})

    const canvas = useMemo(() => {
        return <canvas
            ref={ref}
            width={width}
            height={height}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseDown={handleMouseDown}
        />
    }, [ref, width, height, handleMouseMove, handleMouseUp, handleMouseDown])

    return canvas
})

export default DragCanvas
