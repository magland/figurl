import { TransformationMatrix, transformPoints, Vec2 } from 'figurl/labbox-react/components/DrawingWidget/Geometry'
import { matrix, max, min, multiply } from "mathjs"
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
    oneElectrodeWidth: number // TODO: These are inputs?
    oneElectrodeHeight: number // TODO: These are inputs?
    yScale: number
    width: number
    height: number
    method: 'electrode' | 'combined'
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
    yScale: number
    xMargin: number
}

const computePaths = (transform: TransformationMatrix, waveforms: WaveformPoint[][], electrodes: PixelSpaceElectrode[]): PixelSpacePath[] => {
    const pointsPerWaveform = waveforms[0].length
    // Note: These transforms could be done by funcToTransform instead, e.g.:
    // funcToTransform((p: Vec2): Vec2 => {
    //     const a = canvasWidth/2 + p[0] * (targetPixelW) / 2
    //     const b = canvasHeight/2 + p[1] * (targetPixelH) / 2
    //     return [a, b]
    // })
    // console.log(`Project into rectangle of ${targetPixelW} x ${targetPixelH}`)
    // Note that NONE of this is specific to any particular electrode; we could've just passed this in
    // (Or applied the transform in bulk to the entire set of waveforms)
    // const waveTransform = matrix([[targetPixelW/pointsPerWaveform, 0, -targetPixelW*(.5 + 1/pointsPerWaveform)],
    //                               [0, -(yScale*targetPixelH)/2, 0],//targetPixelH/2],
    //                               [0, 0, 1]]).toArray() as TransformationMatrix
    // Or if you want to see the steps, that's:
    // const wavesToUnitScale = matrix([[1/pointsPerWaveform, 0, -1/pointsPerWaveform],
    //                                  [0, -yScale/2, 0.5],
    //                                  [0, 0, 1]])
    // const pointsToCentralBoxXfrm = matrix([[targetPixelW, 0, 0],
    //                                        [0, targetPixelH, 0],
    //                                        [0, 0, 1]])
    // const combinedTransform = multiply(pointsToCentralBoxXfrm, wavesToUnitScale).toArray() as TransformationMatrix
    
    // console.log(`Converting Waveform. e.g.: ${sampleWaveformData(waveforms)}`)
    // Flatten a list of waveforms (waveforms[i] = WaveformPoint[] = array of {time, amplitude}) to Vec2[] for
    // vectorized point conversion
    const rawPoints = waveforms.map(waveform => waveform.map(pt => [pt.time, pt.amplitude])).flat(1)

    // const pointsProjectedInCentralBox = transformPoints(combinedTransform, rawPoints)
    const pointsProjectedInCentralBox = transformPoints(transform, rawPoints)

    // Could this be neater/better?
    return electrodes.map((e, ii) => {
        const rangeStart = ii * pointsPerWaveform
        // rewrite with splice--don't need iterator?
        const pathForElectrode = pointsProjectedInCentralBox.slice(rangeStart, rangeStart + pointsPerWaveform).map(p => [p[0], p[1]] as Vec2)
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
    if (!ctxt) return  // TODO: log this?

    const colors = waveformOpts?.colors || defaultWaveformColors
    ctxt.strokeStyle = 'red'//colors.base
    ctxt.lineWidth = waveformOpts?.waveformWidth ?? 1
    ctxt.resetTransform()
    ctxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height)
    ctxt.translate(xMargin, 0)
    // console.log(`Realized yScale: ${yScale}`)
    // ctxt.translate(-(targetPixelW || 0)/2, -(targetPixelH || 0)/2) // works for scale-in-path
    // ctxt.translate(-(targetPixelW || 0)/2, 0)//+(targetPixelH || 0)/2)
    // console.log(`Setting default transform ${-(targetPixelW || 0)/2}, ${-(targetPixelH || 0)/2}`)
    // ctxt.scale(1, yScale) // OKAY THIS WON'T WORK--it scales the LINE WIDTH as well as the paths. So it gets Real Bad.
    const baseTransform = ctxt.getTransform()
    // console.log(`${baseTransform}`)
    // console.log(`PixelSpace paths: ${pixelSpacePaths}`)
    pixelSpacePaths.forEach((p) => {
        // console.log(`Offsetting to ${p.offsetFromParentCenter[0]}, ${p.offsetFromParentCenter[1]}`)
        // console.log(`Offsetting to ${p.offsetFromParentCenter[0]}, ${p.offsetFromParentCenter[1]/(yScale)}`)
        // ctxt.translate(p.offsetFromParentCenter[0], p.offsetFromParentCenter[1]/(yScale))
        ctxt.translate(p.offsetFromParentCenter[0], p.offsetFromParentCenter[1]) // works for scale-in-path
        ctxt.beginPath()
        ctxt.moveTo(p.pointsInPaintBox[0][0], p.pointsInPaintBox[0][1])
        p.pointsInPaintBox.forEach((pt) => {
            ctxt.lineTo(pt[0], pt[1])
        })
        ctxt.stroke()
        ctxt.setTransform(baseTransform)
    })
}

const computePathsViaElectrodeTransforms = (waveforms: WaveformPoint[][], electrodes: PixelSpaceElectrode[], yScale: number): PixelSpacePath[] => {
    // console.log(`Realized yscale: ${yScale}`)
    // The transform is actually mapping from the unit square into pixelspace. So we need to normalize the waveform into the unit square first.
    // FIRST THINGS FIRST, we will erase the scale if we don't look at the ENTIRE waveform set.
    const allXs = waveforms.map(w => w.map(pt => pt.time)).flat(2)
    const allYs = waveforms.map(w => w.map(pt => pt.amplitude)).flat(2)
    const xmin = min(allXs)
    const ymin = min(allYs)
    const xrange = max(allXs) - xmin
    const yrange = max(allYs) - ymin
    // we incorporate the yscale factor here to vectorize that too
    /* RELEVANT EXISTING CODE: FROM waveformLayer.ts
            const painter2 = painter.transform(e.transform).transform(funcToTransform(p => {
                return [p[0] / waveform[i].length, 0.5 - (p[1] / 2) * yScaleFactor]
            }))
            // This assumes the time codes start at 1 & that every waveform has the same number of frames.
            // It scales the x-direction to 1/(length)th to fit in a unit square
            // And scales the y-direction to center on 0.5 and vary as actual measurement, times half the yScaleFactor.
            // Incidentally, earlier:
            // const yScaleFactor = (props.ampScaleFactor || 1) / (props.noiseLevel || 1) * 1/10
            // So y-direction scaling is the requested amplitude scale, divided by (10 * noiseLevel).
            // (This isn't really explained but seems important)
    */
    const wavesToUnits = matrix([[1/xrange, 0, -xmin/xrange],
                                //  [0, -yScale/yrange, -ymin/yrange],
                                [0, -yScale/2, 0.5],    // this was in the existing code and I don't know why
                                 [ 0, 0, 1]])
    // const wavesToUnits = funcToTransform(p => {
    //     return [p[0] / xrange, 0.5 - (p[1] /2) * yScale]
    // })
    
    return electrodes.map((e, ii) => {
        const rawPoints = waveforms[ii].map(pt => [pt.time, pt.amplitude])
        const currentTransform = matrix(e.transform)
        const newTransform = multiply(currentTransform, wavesToUnits).toArray() as TransformationMatrix

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
    if (!ctxt) return  // TODO: log this?

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

const Waveform = (props: WaveformProps) => {
    const { electrodes, waveforms, waveformOpts, oneElectrodeHeight, oneElectrodeWidth, yScale, width, height, method, layoutMode } = props
    // console.log(`Rendering Waveform. e.g.: ${sampleWaveformData(waveforms)}`)
    const opts = waveformOpts ?? defaultWaveformOpts
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const canvas = useMemo(() => {
        // console.log(`Creating canvas element with width ${width} and height ${height}`)
        return <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{position: 'absolute', left: 0, top: 0}}
        />
    }, [width, height])

    useEffect(() => {
        if (!waveforms || waveforms.length === 0) return
        if (method === 'electrode') {
            const paths = computePathsViaElectrodeTransforms(waveforms, electrodes, yScale)
            // console.log(`Resulting paths ${samplePathData(paths)}`)
            paintViaElectrodeTransforms({canvasRef, yScale, pixelSpacePaths: paths, waveformOpts: opts, xMargin: 0})
        } else {
            const pointsPerWaveform = waveforms[0].length
            const transform = matrix([[oneElectrodeWidth/pointsPerWaveform, 0, -oneElectrodeWidth*(.5 + 1/pointsPerWaveform)],
                                      [0, -(yScale*oneElectrodeHeight)/2, 0],//targetPixelH/2],
                                      [0, 0, 1]]).toArray() as TransformationMatrix
            const paths = computePaths(transform, waveforms, electrodes)
            // console.log(`Resulting paths ${samplePathData(paths)}`)
            const xMargin = layoutMode === 'vertical' ? (width - oneElectrodeWidth)/2 : 0
            console.log(xMargin)
            paint({canvasRef, yScale, waveformOpts: opts, pixelSpacePaths: paths, xMargin })
        }
    }, [method, waveforms, electrodes, yScale, opts, width, height, oneElectrodeWidth, oneElectrodeHeight, layoutMode])

    return canvas
}

export default Waveform
