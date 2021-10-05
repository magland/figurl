import React, { useEffect, useMemo, useRef, useState } from 'react'
import useDragRect, { DragState } from "./useDragRect"

interface MyProps {
    width: number
    height: number
}

const paintCanvas = (canvasRef: React.MutableRefObject<HTMLCanvasElement | null>, dragState: DragState | undefined) => {
    if (!dragState || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctxt = canvas.getContext('2d')
    if (!ctxt) {
        console.log("Unable to get 2d context.")
        return
    }

    ctxt.clearRect(0, 0, canvas.width, canvas.height)
    if (!dragState.isFinal) {
        const rect = dragState.dragRect || [0, 0, 0, 0]
        ctxt.fillStyle = 'rgba(196, 196, 196, 0.5)'
        ctxt.fillRect(rect[0], rect[1], rect[2], rect[3])
    }
}

const computeSomething = (state: DragState | undefined) => { 
    console.log(`HERE ONE MAY COMPUTE A THINGE`)
}

const DragLayerTest = (props: MyProps) => {
    const { moveHandler, upHandler, downHandler, state } = useDragRect()
    const moveHandlers = useMemo(() => [moveHandler], [moveHandler])
    const upHandlers = [upHandler]
    const downHandlers = [downHandler]
    const [dragState, setDragState] = useState<DragState | undefined>(undefined)

    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        setDragState(state)
        paintCanvas(canvasRef, state)
    }, [state])

    useEffect(() => {
        if(state.isFinal) {
            // console.log(`Received new final state, rect is: ${state.dragRect}`)
            computeSomething(dragState)
        // } else {
        //     console.log(`State should be new (you should only see this once)`)
        }
    }, [state.isFinal]) // sic

    return <div
        style={{
            width: props.width,
            height: props.height
        }}
        // onMouseMove={(e) => {debounceDispatchMove(e)}}
        onMouseMove={(e) => {moveHandlers.forEach((h) => h(e))}}
        // NOTE THIS IS POSSIBLE! But as written it doesn't work b/c you can't re-dispatch the event.
        // Instead the Right Thing To Do is create a duplicate event copying out the properties
        // you actually care about; see https://stackoverflow.com/questions/36408435/how-to-propagate-event-invalidstateerror-failed-to-execute-dispatchevent-on
        // onMouseMove={(e) => {canvasRef.current && canvasRef.current.dispatchEvent(e.nativeEvent)}}
        onMouseDown={(e) => {downHandlers.forEach((h) => h(e))}}
        onMouseUp={(e) => {upHandlers.forEach((h) => h(e))}}
    >
        <canvas
            ref={canvasRef}
            width={props.width}
            height={props.height}
            // onMouseMove={(e) => {moveHandlers.forEach((h) => h(e))}}
        />
    </div>
}

// NOTES:
// 0. Figure out that debounce tho
//      --> It doesn't work like that. You have to debounce within the action, can't preserve events like that.
// 1. DO THIS! https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
// 2. Implement an svg drawing module too
// 3. Just remove most of the canvaspainter. You don't need it. It's just a wrapper on context2d.
// 4. Need a way to convert all nativespace units to pixelspace en masse.
// 5. Logic lives in the logic layer.
// 6. You might ACTUALLY HAVE AN ANSWER on event dispatching, since you need refs anyway to use the canvas!
// (Or maybe you don't! And that's just fine!)

export default DragLayerTest