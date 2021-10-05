import { PixelSpaceElectrode } from "./electrodeGeometryLogic"

export type ElectrodeColors = {
    border: string,
    base: string,
    selected: string,
    hover: string,
    selectedHover: string,
    dragged: string,
    draggedSelected: string,
    dragRect: string,
    textLight: string,
    textDark: string
}

const defaultColors: ElectrodeColors = {
    border: 'rgb(30, 30, 30)',
    base: 'rgb(0, 0, 255)',
    selected: 'rgb(196, 196, 128)',
    hover: 'rgb(128, 128, 255)',
    selectedHover: 'rgb(200, 200, 196)',
    dragged: 'rgb(0, 0, 196)',
    draggedSelected: 'rgb(180, 180, 150)',
    dragRect: 'rgba(196, 196, 196, 0.5)',
    textLight: 'rgb(228, 228, 228)',
    textDark: 'rgb(32, 32, 32)'    
}


// HANDLE SELECTION STATE DISABLED BY ENSURING SELECTION TOOLS ARE DISABLED
type PaintProps = {
    pixelElectrodes: PixelSpaceElectrode[]
    selectedElectrodeIds: number[]
    hoveredElectrodeId?: number
    draggedElectrodeIds: number[]
    pixelRadius: number
    showLabels: boolean
    offsetLabels: boolean
    layoutMode: 'geom' | 'vertical'
    // omitting hideElectrodes b/c what are we drawing if we don't draw electrodes??
    // could also customize colors, offsets, etc. Don't worry for right now
}

const circle = 2 * Math.PI

export const paint = (canvasRef: React.MutableRefObject<HTMLCanvasElement | null>, props: PaintProps) => {
    const { layoutMode } = props
    if (!canvasRef || typeof canvasRef === 'function') return
    const canvas = canvasRef.current
    const ctxt = canvas && canvas.getContext('2d')
    if (!ctxt) {
        console.log('Error getting 2d context for electrode geometry canvas.')
        return
    }
    layoutMode === 'geom' ? paintGeometryView(ctxt, props) : paintVertical(ctxt, props)
}

const paintVertical = (ctxt: CanvasRenderingContext2D, props: PaintProps) => {
    const { pixelElectrodes, pixelRadius, showLabels } = props
    const useLabels = pixelRadius > 5 && showLabels

    ctxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height)
    // TODO: This should be the full width of the drawing space less margin...
    // THIS IS A HACK AND NOT CORRECT, FIX IT
    const xmin = pixelElectrodes[0].pixelX - pixelRadius
    const xmax = pixelElectrodes[0].pixelX + pixelRadius
    ctxt.beginPath()
    pixelElectrodes.forEach(e => {
        ctxt.moveTo(xmin, e.pixelY)
        ctxt.lineTo(xmax, e.pixelY)
    })
    ctxt.strokeStyle = defaultColors.border
    ctxt.stroke()

    if (useLabels) {
        // TODO: DRAW LABELS!!!
    }
}

const paintGeometryView = (ctxt: CanvasRenderingContext2D, props: PaintProps) => {
    const { pixelElectrodes, selectedElectrodeIds, hoveredElectrodeId, draggedElectrodeIds, pixelRadius, showLabels, offsetLabels } = props
    const useLabels = pixelRadius > 5 && showLabels
    // set up fills
    const coloredElectrodes = pixelElectrodes.map(e => {
        const selected = selectedElectrodeIds.includes(e.e.id)
        const hovered = (hoveredElectrodeId ?? -1) === e.e.id
        const dragged = draggedElectrodeIds.includes(e.e.id)
        const color = selected 
            ? dragged
                ? defaultColors.draggedSelected
                : hovered
                    ? defaultColors.selectedHover
                    : defaultColors.selected
            : dragged
                ? defaultColors.dragged
                : hovered
                    ? defaultColors.hover
                    : defaultColors.base
        return {
            ...e,
            color: color,
            textColor: (selected || (hovered && !dragged)) ? defaultColors.textDark : defaultColors.textLight
        }
    })

    // Draw fills
    // all-colors-at-once style: involves a lot fewer strokes but probably not enough to matter
    // coloredElectrodes.sort((a, b) => { return a.color.localeCompare(b.color) })
    // let lastColor = ''
    // coloredElectrodes.forEach(e => {
    //     if (lastColor !== e.color) {
    //         ctxt.fill()
    //         lastColor = e.color
    //         ctxt.fillStyle = e.color
    //         ctxt.beginPath()
    //     }
    // })
    coloredElectrodes.forEach(e => {
        ctxt.fillStyle = e.color
        ctxt.beginPath()
        ctxt.ellipse(e.pixelX, e.pixelY, pixelRadius, pixelRadius, 0, 0, circle)
        ctxt.fill()
    })

    // Draw borders
    ctxt.strokeStyle = defaultColors.border
    pixelElectrodes.forEach(e => {
        ctxt.beginPath()
        ctxt.ellipse(e.pixelX, e.pixelY, pixelRadius, pixelRadius, 0, 0, circle)
        ctxt.stroke()
    })

    // draw electrode labels
    if (useLabels) {
        ctxt.font = `${pixelRadius}px Arial`
        ctxt.textAlign = offsetLabels ? 'right' : 'center'
        ctxt.textBaseline = offsetLabels ? 'bottom' : 'middle'
        const xOffset = offsetLabels ? 1.9 * pixelRadius : 0
        const yOffset = offsetLabels ? 1.7 * pixelRadius : 0
        coloredElectrodes.forEach(e => {
            ctxt.fillStyle = e.textColor
            ctxt.fillText(`${e.e.id}`, e.pixelX - xOffset, e.pixelY - yOffset)
        })
    }
}
