// import { createCalculationPool } from 'labbox';
import { KeypressMap } from 'figurl/labbox-react/components/CanvasWidget';
import { SortingSelection, SortingSelectionDispatch } from 'plugins/sortingview/gui/pluginInterface';
import React, { FunctionComponent, useMemo } from 'react';
import { ElectrodeOpts } from '../gui/extensions/common/sharedCanvasLayers/electrodesLayer';
import { ElectrodeChannel, Waveform } from './AverageWaveformsNumpyPlugin';

type PlotData = {
    average_waveform: number[][]
    channel_ids: number[]
    channel_locations: number[][]
    sampling_frequency: number
}

type Props = {
    electrodeChannels: ElectrodeChannel[]
    waveforms: Waveform[]
    unitId: number
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    width: number
    height: number
    noiseLevel: number
    keypressMap?: KeypressMap
}

// const calculationPool = createCalculationPool({maxSimultaneous: 6})

const AverageWaveformNumpyView: FunctionComponent<Props> = (props) => {
    const { electrodeChannels, waveforms, unitId, selection, selectionDispatch, width, height, noiseLevel, keypressMap } = props
    const plotData: PlotData = useMemo(() => {
        const x: PlotData = {
            average_waveform: [],
            channel_ids: [],
            channel_locations: [],
            sampling_frequency: 30000
        }
        const w = waveforms.filter(w => (w.unitId === unitId))[0]
        if (w) {
            x.average_waveform = w.waveform
            x.channel_ids = w.channelIds
            for (let ch of w.channelIds) {
                x.channel_locations.push(electrodeChannels.filter(ec => (ec.channelId === ch))[0].location)
            }
        }
        return x
    }, [waveforms, electrodeChannels, unitId])

    const electrodeOpts: ElectrodeOpts = useMemo(() => ({
        showLabels: true,
        offsetLabels: true
    }), [])

    const visibleElectrodeIds = selection.visibleElectrodeIds
    const electrodeIds = plotData.channel_ids.filter(id => ((!visibleElectrodeIds) || (visibleElectrodeIds.includes(id))))
    const electrodeLocations = plotData.channel_locations.filter((loc, ii) => ((!visibleElectrodeIds) || (visibleElectrodeIds.includes(plotData.channel_ids[ii]))))
    return ( <br />)
}

export default AverageWaveformNumpyView