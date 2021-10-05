import React, { useEffect, useRef, useState } from 'react'
import DragCanvas, { DragState } from "./DragCanvas"
import { copyMouseEvent } from './utility'

// THIS IS MEANT AS AN EXAMPLE OF HOW TO CONSUME A DRAGCANVAS
// YOU PROBABLY DON'T WANT TO USE IT FOR ANYTYHING IN PARTICULAR

interface DragLayerProps {
    width: number
    height: number
}

const computeSomething = (state: DragState | undefined) => {
    console.log(`HERE ONE MAY COMPUTE A THINGE`)
    console.log(`(Drag area was ${state?.dragRect})`)
}

const DragLayer = (props: DragLayerProps) => {
    const [dragState, setDragState] = useState<DragState>({isFinal: true})
    const dcRef = useRef<HTMLCanvasElement | null>(null)
    const canvas = <DragCanvas
        ref={dcRef}
        width={props.width}
        height={props.height}
        onDragStateChanged={setDragState}
    />

    useEffect(() => {
        if (!dragState) return
        if(dragState.isFinal) {
            computeSomething(dragState)
        }
    }, [dragState.isFinal]) // sic. This represents only a final-state computation, i.e. drag ends.

    return <div
        style={{
            width: props.width,
            height: props.height,
            position: 'relative',
            left: 0, top: 0
        }}
        onMouseMove={(e) => {
            console.log(`Drag layer got a mouse move ${e.shiftKey} ${e.clientX} ${e.clientY}`)
            dcRef.current?.dispatchEvent(copyMouseEvent(e)
        )}}
        onMouseDown={(e) => {
            console.log(`Drag layer got a mouse down ${e.shiftKey} ${e.clientX} ${e.clientY}`)
            dcRef.current?.dispatchEvent(copyMouseEvent(e))
        }}
        onMouseUp={(e) => {
            console.log(`Drag layer got a mouse up ${e.shiftKey} ${e.clientX} ${e.clientY}`)
            dcRef.current?.dispatchEvent(copyMouseEvent(e))
        }}
    >
        {canvas}
    </div>
}

// NOTES:
// 2. Implement an svg drawing module too
// 3. Just remove most of the canvaspainter. You don't need it. It's just a wrapper on context2d.
// 4. Need a way to convert all nativespace units to pixelspace en masse.
// 5. Logic lives in the logic layer.
// x. You might ACTUALLY HAVE AN ANSWER on event dispatching, since you need refs anyway to use the canvas!
// (Or maybe you don't! And that's just fine!)
// x. Figure out that debounce tho
// x. DO THIS! https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258 --> Actually this probably doesn't serve our needs.

export default DragLayer