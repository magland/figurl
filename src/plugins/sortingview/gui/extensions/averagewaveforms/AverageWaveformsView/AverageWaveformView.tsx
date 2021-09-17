// import { createCalculationPool } from 'labbox';
// import TaskStatusView from 'figurl/kachery-react/components/TaskMonitor/TaskStatusView'
import useChannel from 'figurl/kachery-react/useChannel'
import usePureCalculationTask from 'figurl/kachery-react/usePureCalculationTask'
import { KeypressMap } from 'figurl/labbox-react/components/CanvasWidget'
import sortingviewTaskFunctionIds from 'plugins/sortingview/sortingviewTaskFunctionIds'
import React, { Fragment, FunctionComponent, useMemo } from 'react'
import { applyMergesToUnit, Recording, Sorting, SortingCuration, SortingSelectionDispatch } from '../../../pluginInterface'
import { ElectrodeOpts } from '../../common/sharedCanvasLayers/electrodesLayer'
// import WaveformWidget, { defaultWaveformOpts } from './WaveformWidget'

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
    keypressMap: KeypressMap
    snippetLen?: [number, number]
    visibleElectrodeIds?: number[]
    selectedElectrodeIds?: number[]
    ampScaleFactor?: number
    applyMerges?: boolean
    waveformsMode?: 'geom' | 'vertical'
}

// const calculationPool = createCalculationPool({maxSimultaneous: 6})

const AverageWaveformView: FunctionComponent<Props> = ({ sorting, curation, recording, unitId, selectionDispatch, width, height, noiseLevel, keypressMap, snippetLen, visibleElectrodeIds, selectedElectrodeIds, ampScaleFactor, applyMerges, waveformsMode }) => {

    const electrodeOpts: ElectrodeOpts = useMemo(() => ({
        showLabels: true,
        offsetLabels: true
    }), [])
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

    const definedPlotData = plotData || { channel_ids: [], channel_locations: [], average_waveform: [], sampling_frequency: 1 }

    const electrodeIds = useMemo(() => {
        return visibleElectrodeIds && visibleElectrodeIds.length > 0
            ? definedPlotData.channel_ids.filter(id => (visibleElectrodeIds.includes(id)))
            : definedPlotData.channel_ids
    }, [visibleElectrodeIds, definedPlotData.channel_ids])
    const electrodeLocations = useMemo(() => {
        return visibleElectrodeIds && visibleElectrodeIds.length > 0
            ? definedPlotData.channel_locations.filter((loc, ii) => (visibleElectrodeIds.includes(definedPlotData.channel_ids[ii])))
            : definedPlotData.channel_locations
    }, [visibleElectrodeIds, definedPlotData.channel_ids, definedPlotData.channel_locations])

    // TEMPORARY TEST
    return <Fragment>
        <canvas 
            style={{position: 'absolute', left: 0, top: 0}}
            width={width}
            height={height}
            onMouseDown={(e) => console.log(`First canvas got mousedown event: ${e.clientX, e.clientY} with shift? ${e.shiftKey}`)}
        />
        <canvas
            style={{position: 'absolute', left: 0, top: 0}}
            width={width}
            height={height}
            onMouseDown={(e) => console.log(`Second canvas got mousedown event: ${e.clientX, e.clientY} with shift? ${e.shiftKey}`)}
        />
    </Fragment>

    // return plotData
    //     ? <WaveformWidget
    //         waveform={definedPlotData.average_waveform}
    //         layoutMode={waveformsMode || 'geom'}
    //         noiseLevel={noiseLevel}
    //         electrodeIds={electrodeIds}
    //         electrodeLocations={electrodeLocations}
    //         samplingFrequency={definedPlotData.sampling_frequency}
    //         width={width}
    //         height={height}
    //         selectedElectrodeIds={selectedElectrodeIds || []}
    //         ampScaleFactor={ampScaleFactor || 1}
    //         keypressMap={keypressMap}
    //         selectionDispatch={selectionDispatch}
    //         electrodeOpts={electrodeOpts}
    //         waveformOpts={defaultWaveformOpts}
    //     />
    //     : <TaskStatusView task={task} label="fetch avg waveform" />
}

export default AverageWaveformView