import { funcToTransform } from 'figurl/labbox-react/components/CanvasWidget'
import { getBoundingBoxForEllipse, getHeight, getWidth, RectangularRegion, TransformationMatrix, transformPoints, Vec2 } from 'figurl/labbox-react/components/DrawingWidget/Geometry'
import { ceil, min, norm } from "mathjs"
import { getArrayMax, getArrayMin } from "../utility"
import { Electrode } from './ElectrodeGeometry'

export type PixelSpaceElectrode = {
    e: Electrode
    pixelX: number
    pixelY: number
    transform: TransformationMatrix // Dunno if we really need this?
}

const xMargin = 10
const yMargin = 10

const computeRadiusCache = new Map<string, number>()
const computeRadiusDataSpace = (electrodes: Electrode[]): number => {
    const key = JSON.stringify(electrodes)
    const val = computeRadiusCache.get(key)
    if (val !== undefined) {
        return val
    }
    // how big should each electrode dot be? Really depends on how close
    // the dots are to each other. Let's find the closest pair of dots and
    // set the radius to 40% of the distance between them.
    let leastNorm = Number.MAX_VALUE
    electrodes.forEach((point) => {
        electrodes.forEach((otherPoint) => {
            const dist = norm([point.x - otherPoint.x, point.y - otherPoint.y])
            if (dist === 0) return
            leastNorm = Math.min(leastNorm, dist as number)
        })
    })
    // (might set a hard cap, but remember these numbers are in electrode-space coordinates)
    const radius = 0.4 * leastNorm
    computeRadiusCache.set(key, radius)
    return radius
}

const getElectrodeSetBoundingBox = (electrodes: Electrode[], radius: number): RectangularRegion => {
    return {
        xmin: getArrayMin(electrodes.map(e => (e.x))) - radius,
        xmax: getArrayMax(electrodes.map(e => (e.x))) + radius,
        ymin: getArrayMin(electrodes.map(e => (e.y))) - radius,
        ymax: getArrayMax(electrodes.map(e => (e.y))) + radius
    }
}

const getElectrodesAspectRatio = (electrodes: Electrode[]) => {
    const radius = computeRadiusDataSpace(electrodes)
    const boundingBox = getElectrodeSetBoundingBox(electrodes, radius)
    const boxAspect = getWidth(boundingBox) / getHeight(boundingBox)
    return boxAspect
}

const replaceEmptyLocationsWithDefaultLayout = (electrodes: Electrode[]): Electrode[] => {
    // if the electrodes have no actual geometry information, then we'll arrange them
    // linearly in the order they were received.
    const electrodeGeometryRange = {
        xmin: getArrayMin(electrodes.map(e => e.x)),
        xmax: getArrayMax(electrodes.map(e => e.x)),
        ymin: getArrayMin(electrodes.map(e => e.y)),
        ymax: getArrayMax(electrodes.map(e => e.y))
    }
    if ((electrodeGeometryRange.xmin === electrodeGeometryRange.xmax ) &&
        (electrodeGeometryRange.ymin === electrodeGeometryRange.ymax)) {
            return electrodes.map((e, ii) => {return {...e, x: ii, y: 0}})
        }
    return electrodes
}

// For vertical layout, we're just going to draw into the canvas with default margins. No centering (?) or scaling.
const computeDataToPixelTransformVerticalLayout = (width: number, height: number) => {
    return funcToTransform((p: Vec2): Vec2 => {
        const x = xMargin + p[0] * (width - 2 * xMargin)
        const y = yMargin + p[1] * (height - 2 * yMargin)
        return [x, y]
    })
}

// NOTE TO SELF: for vertical layout, radius is 1/(n+1) in dataspace.
// pixelradius is thus (canvas height less vertical margins) / n+1 (where n = # of electrodes).

const convertElectrodesToPixelSpaceVerticalLayout = (electrodes: Electrode[], transform: TransformationMatrix): PixelSpaceElectrode[] => {
    // for vertical layout, we ignore any actual location information and just distribute the electrodes evenly over a column.
    // Do that here by resetting the processed electrode geometry into the assigned points.
    const points = electrodes.map((e, ii) => [0.5, (0.5 + ii)/(1 + electrodes.length)])
    const pixelspacePoints = transformPoints(transform, points)

    // pixelRadius is only used to compute the 'transform' value, which we may not even use...
    return electrodes.map((e, ii) =>  {
        const [pixelX, pixelY] = pixelspacePoints[ii]
        const electrodeBoundingBox: RectangularRegion = {
            xmin: 0,
            xmax: 1,
            ymin: (ii / electrodes.length),
            ymax: ((ii + 1)/electrodes.length)
        }
        return {
            e: e,
            pixelX: pixelX,
            pixelY: pixelY,
            // Note to self: I think this actually is the transform from nativespace to the electrode bounding box's pixelspace directly...
            transform: funcToTransform((p: Vec2): Vec2 => {
                const a = electrodeBoundingBox.xmin + p[0] * (electrodeBoundingBox.xmax - electrodeBoundingBox.xmin)
                const b = electrodeBoundingBox.ymin + p[1] * (electrodeBoundingBox.ymax - electrodeBoundingBox.ymin)
                return [a, b]
            })
        }
    })
}

const getScalingFactor = (width: number, height: number, radius: number, maxElectrodePixelRadius: number, electrodeLayoutBoundingBox: RectangularRegion) => {
    const widthExMargin = width - xMargin * 2
    const heightExMargin = height - yMargin * 2
    const electrodeBoxWidth = getWidth(electrodeLayoutBoundingBox)
    const electrodeBoxHeight = getHeight(electrodeLayoutBoundingBox)

    // We have some underlying electrode geometry and would like to scale it linearly to fill as much
    // of the available canvas space as possible without either clipping or distorting the aspect ratio.
    // Thus the scaling has to be set to the smallest of three factors:
    // - the scaling that will make the layout width equal the canvas width;
    // - the scaling that will make the layout height equal the canvas height;
    // - the scaling that will make the computed radius equal the max permitted radius.
    const scaleFactor: number = min(
        widthExMargin / electrodeBoxWidth,
        heightExMargin / electrodeBoxHeight,
        (maxElectrodePixelRadius / radius)
    )
    return scaleFactor
}

const computeDataToPixelTransform = (width: number, height: number, scaleFactor: number, electrodeLayoutBoundingBox: RectangularRegion) => {
    // We started assuming equal default margins, but that may not hold if the canvas & layout have different shapes.
    // So, to ensure we draw in the center of the canvas, we need to compute the new margins.
    // Do this by taking the scaled layout box out of the total area & splitting the leftover equally between
    // the margins on each side.
    // Since we computed scale using a default margin, the final margin will never be less than the default.
    const electrodeBoxWidth = getWidth(electrodeLayoutBoundingBox)
    const electrodeBoxHeight = getHeight(electrodeLayoutBoundingBox)
    const xMarginFinal = (width - electrodeBoxWidth * scaleFactor) / 2
    const yMarginFinal = (height - electrodeBoxHeight * scaleFactor) / 2

    return funcToTransform((p: Vec2): Vec2 => {
        const x = xMarginFinal + (p[0] - electrodeLayoutBoundingBox.xmin) * scaleFactor
        const y = yMarginFinal + (p[1] - electrodeLayoutBoundingBox.ymin) * scaleFactor
        return [x, y]
    })
}

const normalizeElectrodeLocations = (width: number, height: number, electrodes: Electrode[]): Electrode[] => {
    const canvasAspectRatio = (width - xMargin * 2) / (height - yMargin * 2)
    const _electrodes = replaceEmptyLocationsWithDefaultLayout(electrodes)
    const boxAspectRatio = getElectrodesAspectRatio(_electrodes)
    if ((boxAspectRatio > 1) === (canvasAspectRatio > 1)) {
        // Aspect ratios > 1 are portrait mode. < 1 are landscape. We want to check that the orientations match.
        // If they do, just return the input.
        return electrodes
    }
    // If the orientations don't match, we'll rotate the electrode set 90 degrees CCW around the origin.
    // (This is accomplished by making new-x = old-y and new-y = negative old-x.)
    // Subsequent functions will then pick up the new bounding box correctly.
    return electrodes.map((e) => {return {...e, x: e.y, y: -e.x }})
}

const convertElectrodesToPixelSpace = (electrodes: Electrode[], transform: TransformationMatrix, pixelRadius: number): PixelSpaceElectrode[] => {
    const points = electrodes.map((e) => [e.x, e.y])
    const pixelspacePoints = transformPoints(transform, points)
    // pixelRadius is only used to compute the 'transform' value, which we may not even use...
    return electrodes.map((e, ii) =>  {
        const [pixelX, pixelY] = pixelspacePoints[ii]
        const electrodeBoundingBox = getBoundingBoxForEllipse([pixelX, pixelY], pixelRadius, pixelRadius)
        return {
            e: e,
            pixelX: pixelX,
            pixelY: pixelY,
            // Note to self: I think this actually is the transform from nativespace to the electrode bounding box's pixelspace directly...
            transform: funcToTransform((p: Vec2): Vec2 => {
                const a = electrodeBoundingBox.xmin + p[0] * (electrodeBoundingBox.xmax - electrodeBoundingBox.xmin)
                const b = electrodeBoundingBox.ymin + p[1] * (electrodeBoundingBox.ymax - electrodeBoundingBox.ymin)
                return [a, b]
            })
        }
    })
}

export const getElectrodeAtPoint = (electrodes: PixelSpaceElectrode[], pixelRadius: number, mouseLoc: Vec2) => {
    // Assumption: electrode regions do not overlap, thus being within the radius of one makes it impossible
    // to be in the radius of any other. So we use a for ... of loop, allowing early stopping.
    for (const e of electrodes) {
        // const dist = norm([point.x - otherPoint.x, point.y - otherPoint.y])
        if (norm([e.pixelX - mouseLoc[0], e.pixelY - mouseLoc[1]]) < pixelRadius) return e.e.id
    }
    return undefined
}

export const getDraggedElectrodeIds = (electrodes: PixelSpaceElectrode[], dragRect: RectangularRegion, pixelRadius: number): number[] => {
    // Rather than computing boundingboxes for each electrode, let's just expand the selection region by the
    // known pixel radius & check the electrode centers that are within the expanded selection box.
    const xmin = dragRect.xmin - pixelRadius
    const xmax = dragRect.xmax + pixelRadius
    const ymin = dragRect.ymin - pixelRadius
    const ymax = dragRect.ymax + pixelRadius
    return electrodes
        .filter((e) => e.pixelX > xmin && e.pixelX < xmax && e.pixelY > ymin && e.pixelY < ymax)
        .map((e) => e.e.id)
}

// Consumer cares about overall transform, electrode pixel locations, and pixel radius. That's all.
export const computeElectrodeLocations = (canvasWidth: number, canvasHeight: number, electrodes: Electrode[], mode: 'geom' | 'vertical' = 'geom', maxElectrodePixelRadius: number = 25) => {
    if (mode === 'vertical') {
        const transform = computeDataToPixelTransformVerticalLayout(canvasWidth, canvasHeight)
        const convertedElectrodes = convertElectrodesToPixelSpaceVerticalLayout(electrodes, transform)
        const pixelRadius = (canvasHeight - 2*yMargin) / (1 + electrodes.length)
        return {
            transform: transform,
            convertedElectrodes: convertedElectrodes,
            pixelRadius: pixelRadius
        }
    }

    const normalizedElectrodes = normalizeElectrodeLocations(canvasWidth, canvasHeight, electrodes)
    const nativeRadius = computeRadiusDataSpace(normalizedElectrodes)

    const nativeBoundingBox = getElectrodeSetBoundingBox(normalizedElectrodes, nativeRadius)
    const scaleFactor = getScalingFactor(canvasWidth, canvasHeight, nativeRadius, maxElectrodePixelRadius, nativeBoundingBox)
    const pixelRadius = nativeRadius * scaleFactor
    const transform = computeDataToPixelTransform(canvasWidth, canvasHeight, scaleFactor, nativeBoundingBox)
    const convertedElectrodes = convertElectrodesToPixelSpace(normalizedElectrodes, transform, pixelRadius)
    console.log(`Calculated pixel radius as ${pixelRadius}`)
    return {
        transform: transform,
        convertedElectrodes: convertedElectrodes,
        pixelRadius: ceil(pixelRadius)
        // pixelRadius: pixelRadius
    }
}


// We need to be able to do several things:
// DONE compute the transformation matrix from dataspace to pixelspace.
// DONE compute electrode bounding boxes (in pixelspace)
// ----> NOTE: FOR NOW, we're going to build these on the assumption we'll need them.
//      However in reality we may not, if we convert to pixelspace & draw.
//      QUERY: Should we be trying to do any of this by manipulating the context translation???
// DONE compute pixelspace electrode locations
//    and the (shared) radius (DONE)
// DONE As part of this, compute the orientation and adjust accordingly
// DONE provide logic to determine lists of which electrodes are hovered/drag-selected/clicked
// --> (that can maybe go away in an svg implementation)

// Paint method belongs to the other guy

