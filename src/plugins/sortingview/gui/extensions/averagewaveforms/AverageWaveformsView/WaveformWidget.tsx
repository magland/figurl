import CanvasWidget, { funcToTransform, KeypressMap, PainterPath } from 'figurl/labbox-react/components/CanvasWidget'
import { toTransformationMatrix } from 'figurl/labbox-react/components/CanvasWidget/Geometry'
import { useLayer, useLayers } from 'figurl/labbox-react/components/CanvasWidget/useLayer'
import { matrix, multiply } from 'mathjs'
import React, { FunctionComponent, useMemo } from 'react'
import { RecordingSelectionDispatch } from '../../../pluginInterface'
import { createElectrodesLayer, ElectrodeColors, ElectrodeLayerProps, ElectrodeOpts } from '../../common/sharedCanvasLayers/electrodesLayer'
import setupElectrodes, { ElectrodeBox } from '../../common/sharedCanvasLayers/setupElectrodes'
import { createWaveformLayer, WaveformColors, WaveformLayerProps } from './waveformLayer'


export type WaveformWidgetProps = {
    waveform?: number[][]
    ampScaleFactor: number
    layoutMode: 'geom' | 'vertical'
    width: number
    height: number
    selectedElectrodeIds: number[]
    selectionDispatch: RecordingSelectionDispatch
    electrodeOpts: ElectrodeOpts
    keypressMap?: KeypressMap
    noiseLevel: number
    electrodeIds: number[]
    electrodeLocations: number[][]
    samplingFrequency: number
    waveformOpts: {
        colors?: WaveformColors
        waveformWidth: number
    }
}

const electrodeColors: ElectrodeColors = {
    border: 'rgb(120, 100, 120)',
    base: 'rgb(240, 240, 240)',
    selected: 'rgb(196, 196, 128)',
    hover: 'rgb(128, 128, 255)',
    selectedHover: 'rgb(200, 200, 196)',
    dragged: 'rgb(0, 0, 196)',
    draggedSelected: 'rgb(180, 180, 150)',
    dragRect: 'rgba(196, 196, 196, 0.5)',
    textLight: 'rgb(32, 92, 92)',
    textDark: 'rgb(32, 150, 150)'
}
const waveformColors: WaveformColors = {
    base: 'black'
}

const defaultElectrodeOpts = {
    colors: electrodeColors,
    showLabels: false
}

export const defaultWaveformOpts = {
    colors: waveformColors,
    waveformWidth: 2
}

const WaveformWidget: FunctionComponent<WaveformWidgetProps> = (props) => {
    const electrodeOpts = useMemo(() => ({...defaultElectrodeOpts, ...props.electrodeOpts}), [props.electrodeOpts])
    const waveformOpts = useMemo(() => ({...defaultWaveformOpts, ...props.waveformOpts}), [props.waveformOpts])

    const electrodesSetup = useMemo(() => {
        return setupElectrodes({
            width: props.width,
            height: props.height,
            electrodeLocations: props.electrodeLocations,
            electrodeIds: props.electrodeIds,
            layoutMode: props.layoutMode,
            maxElectrodePixelRadius: electrodeOpts.maxElectrodePixelRadius})
    }, [props.width, props.height, props.electrodeLocations, props.electrodeIds, props.layoutMode, electrodeOpts.maxElectrodePixelRadius])

    const yScaleFactor = useMemo(() => ((props.ampScaleFactor || 1) / (props.noiseLevel || 1) * 1/10), [props.ampScaleFactor, props.noiseLevel])
    const waveformLength = useMemo(() => ((props?.waveform && props.waveform[0]?.length) || 1), [props.waveform])
    const scaledTransform = useMemo(() => {
        return funcToTransform(p => {return [p[0] / waveformLength, 0.5 - (p[1] / 2) * yScaleFactor]})
    }, [waveformLength, yScaleFactor])
    // This works, given the (pretty weak) assumption that all waveforms have the same number of time points
    const configuredElectrodeBoxes: ElectrodeBox[] = useMemo(() => {
        return electrodesSetup.electrodeBoxes.map((box) => {
            return {...box, transform: toTransformationMatrix(multiply(matrix(box.transform), matrix(scaledTransform)))}
        })
    }, [electrodesSetup.electrodeBoxes, scaledTransform])

    const paths: PainterPath[] = useMemo(() => {
        return ((props.waveform || []).map((wave) => {
            const path = new PainterPath()
            wave.forEach((naturalAmplitude, t) => {
                path.lineTo(t, naturalAmplitude)
            })
            return path
        }))
    }, [props.waveform])

    const waveformLayerProps: WaveformLayerProps = useMemo(() => ({
        electrodeBoxes: configuredElectrodeBoxes,
        paths: paths,
        transform: electrodesSetup.transform,
        waveformOpts,
        width: props.width,
        height: props.height
    }), [configuredElectrodeBoxes, paths, electrodesSetup.transform, waveformOpts, props.width, props.height])

    const electrodeLayerProps: ElectrodeLayerProps = useMemo(() => {
        return {
            transform: electrodesSetup.transform,
            electrodeBoxes: electrodesSetup.electrodeBoxes,
            radius: electrodesSetup.radius,
            pixelRadius: electrodesSetup.pixelRadius,
            layoutMode: props.layoutMode,
            width: props.width,
            height: props.height,
            selectedElectrodeIds: props.selectedElectrodeIds,
            selectionDispatch: props.selectionDispatch,
            electrodeOpts
        }
    }, [electrodesSetup, props.layoutMode, props.width, props.height, props.selectedElectrodeIds, props.selectionDispatch, electrodeOpts])

    const electrodesLayer = useLayer(createElectrodesLayer, electrodeLayerProps)
    const waveformLayer = useLayer(createWaveformLayer, waveformLayerProps)
    const layers = useLayers([electrodesLayer, waveformLayer])
    return (
        <CanvasWidget
            layers={layers}
            {...{width: props.width, height: props.height}}
        />
    )
}

export default WaveformWidget