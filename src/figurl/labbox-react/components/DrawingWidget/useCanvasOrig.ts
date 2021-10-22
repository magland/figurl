import { useEffect, useRef } from 'react'

// largely suggested by https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
// I think this is actually not a good idea for what we want to do--there's really no
// neat way to trigger the redraw on the underlying canvas when the data changes.

export type CanvasOptions = {
    context?: '2d' | '3d',
    animated?: boolean
}

export interface DrawFnProps {
    context: CanvasRenderingContext2D // RenderingContext
    frameCount?: number
    props?: any
}

export interface UseCanvasProps {
    draw: (props: DrawFnProps) => void,
    options: CanvasOptions
}

// Query: do I need a forwardRef setup here
const useCanvas = (props: UseCanvasProps) => {
    const { draw, options={} } = props
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')

        let frameCount = 0
        let animationFrameId: number
        const render = () => {
            frameCount++
            if (!context) return
            draw({
                context: context,
                frameCount: frameCount,
            })
            if (options.animated)
                animationFrameId = window.requestAnimationFrame(render)
        }
        render()
        return () => {
            options.animated && window.cancelAnimationFrame(animationFrameId)
        }
    }, [draw, options.context, options.animated])

    return canvasRef
}

// Actually instead of an options param let's use a separate hook for animated canvases?

export default useCanvas