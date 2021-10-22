import React, { useEffect, useRef } from 'react'

const baseCanvasStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0
}

const getDrawingContextFromCanvasRef = (canvasRef: React.MutableRefObject<HTMLCanvasElement | null>, ) => {
    if (!canvasRef || typeof canvasRef === 'function') return undefined
    const canvas = canvasRef.current
    const ctxt = canvas && canvas.getContext('2d')
    if (!ctxt) return undefined
    return ctxt
}

type DrawFn<T> = (ctxt: CanvasRenderingContext2D, data: T) => void
export interface BaseCanvasProps<T> {
    width: number
    height: number
    draw: DrawFn<T>
    drawData: T
}

// We may we want to provide more narrowing on T going forward, but
// mostly the extends-object is just there so the parser knows it isn't
// an unclosed HTML tag.
const BaseCanvas = <T extends {}> (props: BaseCanvasProps<T>) => {
    const { width, height, draw, drawData } = props
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const ctxt = getDrawingContextFromCanvasRef(canvasRef)
        ctxt && ctxt.canvas && draw(ctxt, drawData)
    }, [draw, canvasRef, drawData])

    return <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={baseCanvasStyle}
    />
}

export default BaseCanvas
