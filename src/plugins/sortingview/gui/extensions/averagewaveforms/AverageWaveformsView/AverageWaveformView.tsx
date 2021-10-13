import TaskStatusView from 'figurl/kachery-react/components/TaskMonitor/TaskStatusView'
import useChannel from 'figurl/kachery-react/useChannel'
import usePureCalculationTask from 'figurl/kachery-react/usePureCalculationTask'
import sortingviewTaskFunctionIds from 'plugins/sortingview/sortingviewTaskFunctionIds'
import React, { FunctionComponent } from 'react'
import { applyMergesToUnit, Recording, Sorting, SortingCuration, SortingSelectionDispatch } from '../../../pluginInterface'
import WaveformWidget, { defaultWaveformOpts } from './WaveformWidget'

// TODO: Keypresses

export type PlotData = {
    average_waveform: number[][]
    channel_ids: number[]
    channel_locations: number[][]
    sampling_frequency: number
}

type Props = {
    sorting: Sorting
    recording: Recording
    unitId: number
    selectionDispatch: SortingSelectionDispatch
    curation?: SortingCuration
    width: number
    height: number
    noiseLevel: number
    snippetLen?: [number, number]
    visibleElectrodeIds?: number[]
    selectedElectrodeIds?: number[]
    ampScaleFactor?: number
    applyMerges?: boolean
    waveformsMode?: 'geom' | 'vertical'
}

// const calculationPool = createCalculationPool({maxSimultaneous: 6})

const defaultPlotData = { channel_ids: [], channel_locations: [], average_waveform: [], sampling_frequency: 1 }

const AverageWaveformView: FunctionComponent<Props> = ({ sorting, curation, recording, unitId, selectionDispatch, width, height, noiseLevel, snippetLen, visibleElectrodeIds, selectedElectrodeIds, ampScaleFactor, applyMerges, waveformsMode }) => {
    const {channelName} = useChannel()

    const {returnValue: plotData, task} = usePureCalculationTask<PlotData>(
        sortingviewTaskFunctionIds.fetchAverageWaveform,
        {
            sorting_object: sorting.sortingObject,
            recording_object: recording.recordingObject,
            unit_id: applyMergesToUnit(unitId, curation, applyMerges),
            snippet_len: snippetLen
        },
        {
            channelName
        }
    )

    const definedPlotData = plotData || defaultPlotData
    const electrodes = definedPlotData.channel_ids.map((id, ii) => {
        return {
            id: id,
            label: `${id}`,
            x: definedPlotData.channel_locations[ii][0],
            y: definedPlotData.channel_locations[ii][1]
        }
    })
    const useFilter = visibleElectrodeIds && visibleElectrodeIds.length > 0
    const visibleElectrodes = electrodes.filter((e) => !useFilter || (visibleElectrodeIds || []).includes(e.id))

    return plotData
        ? <WaveformWidget
            waveforms={definedPlotData.average_waveform}
            ampScaleFactor={ampScaleFactor || 1}
            electrodes={visibleElectrodes}
            layoutMode={waveformsMode || 'geom'}
            noiseLevel={noiseLevel}
            samplingFrequency={definedPlotData.sampling_frequency}
            width={width}
            height={height}
            selectedElectrodeIds={selectedElectrodeIds || []}
            selectionDispatch={selectionDispatch}
            showLabels={true}
            waveformOpts={defaultWaveformOpts}
        />
        : <TaskStatusView task={task} label="fetch avg waveform" />
}

export default AverageWaveformView