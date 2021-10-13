import { FunctionComponent, useMemo } from 'react'
import { RecordingSelectionDispatch } from '../../../pluginInterface'
import ElectrodeGeometry, { Electrode, LayoutMode } from "../../common/sharedDrawnComponents/ElectrodeGeometry"
import { computeElectrodeLocations, xMargin as xMarginDefault } from '../../common/sharedDrawnComponents/electrodeGeometryLayout'
import { ElectrodeColors } from '../../common/sharedDrawnComponents/electrodeGeometryPainting'
import { getSpikeAmplitudeNormalizationFactor } from '../../common/waveformLogic/waveformLogic'
import Waveform, { WaveformColors, WaveformPoint } from './Waveform'


export type WaveformWidgetProps = {
    waveforms?: number[][]
    ampScaleFactor: number
    electrodes: Electrode[]
    layoutMode: LayoutMode
    width: number
    height: number
    selectedElectrodeIds: number[]
    selectionDispatch: RecordingSelectionDispatch
    colors?: ElectrodeColors
    showLabels?: boolean
    noiseLevel: number
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

// TODO: FIX AVG WAVEFORM NUMPY VIEW
// TODO: FIX SNIPPET BOX
const WaveformWidget: FunctionComponent<WaveformWidgetProps> = (props) => {
    const showLabels = props.showLabels ?? defaultElectrodeOpts.showLabels
    const colors = props.colors ?? defaultElectrodeOpts.colors
    const waveformOpts = useMemo(() => ({...defaultWaveformOpts, ...props.waveformOpts}), [props.waveformOpts])
    const {electrodes, selectedElectrodeIds, selectionDispatch, waveforms, ampScaleFactor, layoutMode, width, height} = props

    const geometry = useMemo(() => <ElectrodeGeometry
        electrodes={electrodes}
        selectedElectrodeIds={selectedElectrodeIds}
        selectionDispatch={selectionDispatch}
        width={width}
        height={height}
        layoutMode={layoutMode}
        colors={colors}
        showLabels={showLabels}      // Would we ever not want to show labels for this?
        offsetLabels={true}
        maxElectrodePixelRadius={25} // ??
        disableSelection={true}      // ??
    />, [electrodes, selectedElectrodeIds, selectionDispatch, width, height, layoutMode, colors, showLabels])

    // TODO: Don't do this twice, work it out differently
    const { convertedElectrodes, pixelRadius, xMargin: xMarginBase } = computeElectrodeLocations(width, height, electrodes, layoutMode, 25)
    const xMargin = xMarginBase || xMarginDefault

    // Spikes are defined as being some factor greater than the baseline noise.
    const amplitudeNormalizationFactor = useMemo(() => getSpikeAmplitudeNormalizationFactor(props.noiseLevel), [props.noiseLevel])
    const yScaleFactor = useMemo(() => (ampScaleFactor * amplitudeNormalizationFactor), [ampScaleFactor, amplitudeNormalizationFactor])

    // 'waveforms' is a list of lists of points. There's one outer list per channel (so far so good).
    // The inner list is just a list of numbers, but they should be interpreted as pairs of (amplitude, time).
    // So to get the job result into something structured, you need to iterate *pairwise* over the inner list.
    const baseWaveformPoints: WaveformPoint[][] = waveforms?.map(waveformDataSet => 
        {
            return waveformDataSet.map((amplitude, time) => {
                return { amplitude, time } as WaveformPoint
            })
        }) ?? []
    
    // TODO: THIS LOGIC PROBABLY SHOULDN'T BE REPEATED HERE AND IN THE ELECTRODE GEOMETRY PAINT FUNCTION
    const oneElectrodeHeight = layoutMode === 'geom' ? pixelRadius * 2 : height / electrodes.length
    const oneElectrodeWidth = layoutMode === 'geom' ? pixelRadius * 2 : width - xMargin - (showLabels ? 2*pixelRadius : 0)
    const waveform = <Waveform
        electrodes={convertedElectrodes}
        waveforms={baseWaveformPoints}
        waveformOpts={waveformOpts}
        oneElectrodeHeight={oneElectrodeHeight}
        oneElectrodeWidth={oneElectrodeWidth}
        yScale={yScaleFactor}
        width={width}
        height={height}
        layoutMode={layoutMode}
    />

    return (
        <div
            style={{
                width: width,
                height: height,
                position: 'relative',
                left: 0,
                top: 0
            }}
        >
            {geometry}
            {waveform}
        </div>
    )
}

export default WaveformWidget