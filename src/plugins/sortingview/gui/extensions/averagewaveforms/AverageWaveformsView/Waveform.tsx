import { TransformationMatrix, transformPoints, Vec2 } from 'figurl/labbox-react/components/DrawingWidget/Geometry'
import { matrix, multiply } from "mathjs"
import { useEffect, useMemo, useRef } from 'react'
import { LayoutMode, PixelSpaceElectrode } from '../../common/sharedDrawnComponents/ElectrodeGeometry'
import { defaultWaveformOpts } from './WaveformWidget'


export type WaveformColors = {
    base: string
}
const defaultWaveformColors: WaveformColors = {
    base: 'black'
}

export type WaveformPoint = {
    amplitude: number,
    time: number
}

export type WaveformProps = {
    electrodes: PixelSpaceElectrode[]
    waveforms?: WaveformPoint[][]
    waveformOpts: {
        colors?: WaveformColors
        waveformWidth: number
    }
    oneElectrodeWidth: number
    oneElectrodeHeight: number
    yScale: number
    width: number
    height: number
    layoutMode?: LayoutMode
}

type PixelSpacePath = {
    pointsInPaintBox: Vec2[]
    offsetFromParentCenter: Vec2
}

type PaintProps = {
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>
    waveformOpts: {
        colors?: WaveformColors
        waveformWidth: number
    }
    pixelSpacePaths: PixelSpacePath[]
    xMargin: number
}

const computePaths = (transform: TransformationMatrix, waveforms: WaveformPoint[][], electrodes: PixelSpaceElectrode[]): PixelSpacePath[] => {
    const pointsPerWaveform = waveforms[0].length
    // Flatten a list of waveforms (waveforms[i] = WaveformPoint[] = array of {time, amplitude}) to Vec2[] for vectorized point conversion
    const rawPoints = waveforms.map(waveform => waveform.map(pt => [pt.time, pt.amplitude])).flat(1)
    const pointsProjectedToElectrodeBox = transformPoints(transform, rawPoints)

    return electrodes.map((e, ii) => {
        const rangeStart = ii * pointsPerWaveform
        // rewrite with splice to avoid iterator?
        const pathForElectrode = pointsProjectedToElectrodeBox.slice(rangeStart, rangeStart + pointsPerWaveform).map(p => [p[0], p[1]] as Vec2)
        return {
            pointsInPaintBox: pathForElectrode,
            offsetFromParentCenter: [e.pixelX, e.pixelY]
        }
    })
}

const paint = (props: PaintProps) => {
    const { canvasRef, waveformOpts, pixelSpacePaths, xMargin } = props

    if (!pixelSpacePaths || pixelSpacePaths.length === 0) return
    if (!canvasRef || typeof canvasRef === 'function') return
    const canvas = canvasRef.current
    const ctxt = canvas && canvas.getContext('2d')
    if (!ctxt) return  // Should we log when this happens?

    const colors = waveformOpts?.colors || defaultWaveformColors
    ctxt.strokeStyle = colors.base
    ctxt.lineWidth = waveformOpts?.waveformWidth ?? 1
    ctxt.resetTransform()
    ctxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height)
    ctxt.translate(xMargin, 0)
    // ctxt.scale(1, yScale) // This would be a neat native way to adjust the vertical scaling, BUT it changes the pen aspect ratio.
    // So it doesn't work, alas. Leaving this comment here as a warning to future generations.
    const baseTransform = ctxt.getTransform()
    pixelSpacePaths.forEach((p) => {
        ctxt.translate(p.offsetFromParentCenter[0], p.offsetFromParentCenter[1])
        ctxt.beginPath()
        ctxt.moveTo(p.pointsInPaintBox[0][0], p.pointsInPaintBox[0][1])
        p.pointsInPaintBox.forEach((pt) => {
            ctxt.lineTo(pt[0], pt[1])
        })
        ctxt.stroke()
        ctxt.setTransform(baseTransform)
    })
}

const Waveform = (props: WaveformProps) => {
    const { electrodes, waveforms, waveformOpts, oneElectrodeHeight, oneElectrodeWidth, yScale, width, height, layoutMode } = props
    const opts = waveformOpts ?? defaultWaveformOpts
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const canvas = useMemo(() => {
        return <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{position: 'absolute', left: 0, top: 0}}
        />
    }, [width, height])

    useEffect(() => {
        if (!waveforms || waveforms.length === 0) return
        const pointsPerWaveform = waveforms[0].length           // assumed constant across snippets
        const timeScale = oneElectrodeWidth/pointsPerWaveform   // converts the frame numbers (1..130 or w/e) to pixel width of electrode
        const offsetToCenter = -oneElectrodeWidth*(.5 + 1/pointsPerWaveform) // adjusts the waveforms to start at the left of the electrode, not its center
        const finalYScale = (yScale*oneElectrodeHeight)/2       // scales waveform amplitudes to the pixel height of a single electrode
                                                                // (...roughly. We'll exceed that height if the user dials up the scaling.)
        const transform = matrix([[timeScale,               0,   offsetToCenter],
                                  [        0,    -finalYScale,                0],
                                  [        0,               0,                1]]
                                ).toArray() as TransformationMatrix
        const paths = computePaths(transform, waveforms, electrodes)
        const xMargin = layoutMode === 'vertical' ? (width - oneElectrodeWidth)/2 : 0
        paint({canvasRef, waveformOpts: opts, pixelSpacePaths: paths, xMargin })
    }, [waveforms, electrodes, yScale, opts, width, height, oneElectrodeWidth, oneElectrodeHeight, layoutMode])

    return canvas
}
// (Note: The transform matrix above could also be computed by funcToTransform.)
// The transform matrix combines two transforms: one maps waveform data into a roughly-unit-square system,
// and the other maps a unit-square to the pixel area of one electrode. Breaking those steps out looks like this:
// const wavesToUnitScale = matrix([[1/pointsPerWaveform,         0, -1/pointsPerWaveform],
//                                  [                  0, -yScale/2,                  0.5],
//                                  [                  0,         0,                    1]])
// const pointsToCentralBoxXfrm = matrix([[targetPixelW, 0,            0],
//                                        [0,            targetPixelH, 0],
//                                        [0,            0,            1]])
// const combinedTransform = multiply(pointsToCentralBoxXfrm, wavesToUnitScale).toArray() as TransformationMatrix
// but there's no need to actually make the computer do the math every time since we know what the result
// should be. (Also notice the -yScale term to invert the axis, since pixel Ys increase as you move downward.)


// Data-report functions for debugging:
// const sampleWaveformData = (waveforms?: WaveformPoint[][]): string => {
//     if (!waveforms) return ""
//     const firstWave = waveforms[0]
//     const start = firstWave.slice(0, 5).map(a => `${a.time}, ${a.amplitude}`)
//     const mid = firstWave.slice(70, 75).map(a => `${a.time}, ${a.amplitude}`)
//     const end = firstWave.slice(120, 125).map(a => `${a.time}, ${a.amplitude}`)
//     return [...start, ...mid, ...end].join('\n')
// }

// const samplePathData = (paths?: PixelSpacePath[]): string => {
//     if (!paths) return ""
//     const firstPath = paths[0]
//     const start = firstPath.pointsInPaintBox.slice(0, 5).map(a => `${a[0]}, ${a[1]}`)
//     const mid = firstPath.pointsInPaintBox.slice(70, 75).map(a => `${a[0]}, ${a[1]}`)
//     const end = firstPath.pointsInPaintBox.slice(120, 125).map(a => `${a[0]}, ${a[1]}`)
//     const displacement = `adjust to ${firstPath.offsetFromParentCenter[0]}, ${firstPath.offsetFromParentCenter[1]}`
//     return [...start, ...mid, ...end, displacement].join('\n')
// }


// Note: This code is left as an example of the prior way of doing things, but it's not needed for anything
// (and also doesn't work properly for vertical-layout.)
const computePathsViaElectrodeTransforms = (waveforms: WaveformPoint[][], electrodes: PixelSpaceElectrode[], yScale: number): PixelSpacePath[] => {
    // Each electrode's transform maps the unit square into pixelspace. So we need to normalize the waveform's time (x) dimension
    // into unit distance. (The y dimension will already be accounted for by noise-scaling factors.)
    const xrange = waveforms[0].length
    const wavesToUnits = matrix([[1/xrange,  0,        -1/xrange],
                                 [ 0,       -yScale/2,       0.5],
                                 [ 0,        0,                1]])
    // (The funcToTransform equivalent):
    // const wavesToUnits = funcToTransform(p => {
    //     return [p[0] / xrange, 0.5 - (p[1] /2) * yScale]
    // })
    
    return electrodes.map((e, ii) => {
        const rawPoints = waveforms[ii].map(pt => [pt.time, pt.amplitude])
        const electrodeBaseTransform = matrix(e.transform)
        const newTransform = multiply(electrodeBaseTransform, wavesToUnits).toArray() as TransformationMatrix

        const points = transformPoints(newTransform, rawPoints)
        return {
            pointsInPaintBox: points,
            offsetFromParentCenter: [e.pixelX, e.pixelY]
        }
    })
}

const paintViaElectrodeTransforms = (props: PaintProps) => {
    const { canvasRef, waveformOpts, pixelSpacePaths } = props

    if (!pixelSpacePaths || pixelSpacePaths.length === 0) return
    if (!canvasRef || typeof canvasRef === 'function') return
    const canvas = canvasRef.current
    const ctxt = canvas && canvas.getContext('2d')
    if (!ctxt) return

    const colors = waveformOpts?.colors || defaultWaveformColors
    ctxt.strokeStyle = colors.base
    ctxt.lineWidth = waveformOpts?.waveformWidth ?? 1
    ctxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height)
    pixelSpacePaths.forEach((p) => {
        ctxt.beginPath()
        ctxt.moveTo(p.pointsInPaintBox[0][0], p.pointsInPaintBox[0][1])
        p.pointsInPaintBox.forEach((pt) => {
            ctxt.lineTo(pt[0], pt[1])
        })
        ctxt.stroke()
    })
}

export default Waveform
