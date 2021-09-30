import { isArrayOf, isEqualTo, isOneOf, isString, _validateObject } from "commonInterface/kacheryTypes";
import TaskStatusView from "figurl/kachery-react/components/TaskMonitor/TaskStatusView";
import { FigurlPlugin } from "figurl/types";
import { FunctionComponent, useEffect, useReducer } from "react";
import { timeseriesSelectionReducer } from "./interface/TimeseriesSelection";
import MultiPanelTimeseriesView from "./MultiPanelTimeseriesView";
import useSeriesInfo from "./useSeriesInfo";

type EventAmplitudesPanelData = {
    type: 'EventAmplitudes',
    label: string,
    data: {
        seriesUri: string
    }
}

const isEventAmplitudesPanelData = (x: any): x is EventAmplitudesPanelData => {
    const isData = (y: any) => {
        return _validateObject(y, {
            seriesUri: isString
        })
    }
    return _validateObject(x, {
        type: isEqualTo('EventAmplitudes'),
        label: isString,
        data: isData
    })
}

export type PanelData = EventAmplitudesPanelData

const isPanelData = (x: any): x is PanelData => {
    return isOneOf([
        isEventAmplitudesPanelData
    ])(x)
}

type MultiPanelTimeseriesData = {
    panels: PanelData[]
}

const isMultiPanelTimeseriesData = (x: any): x is MultiPanelTimeseriesData => {
    return _validateObject(x, {
        panels: isArrayOf(isPanelData)
    })
}

type Props = {
    data: MultiPanelTimeseriesData
    width: number
    height: number
}


const MultiPanelTimeseriesComponent: FunctionComponent<Props> = ({data, width, height}) => {
    const {panels} = data
    const {seriesInfo, task} = useSeriesInfo(panels[0].data.seriesUri)
    const [timeseriesSelection, timeseriesSelectionDispatch] = useReducer(timeseriesSelectionReducer, {})
    useEffect(() => {
        if (!seriesInfo) return
        timeseriesSelectionDispatch({type: 'SetStartEndTime', startTime: seriesInfo.startTime, endTime: seriesInfo.endTime})
    }, [seriesInfo])
    useEffect(() => {
        if (!seriesInfo) return
        timeseriesSelectionDispatch({
            type: 'SetTimeRange',
            timeRange: {min: seriesInfo.startTime, max: seriesInfo.endTime}
        })
    }, [seriesInfo])
    if (!seriesInfo) return (
        <TaskStatusView task={task} label="Loading timeseries info" />
    )
    return (
        <MultiPanelTimeseriesView
            panels={panels}
            width={width}
            height={height}
            timeseriesSelection={timeseriesSelection}
            timeseriesSelectionDispatch={timeseriesSelectionDispatch}
        />
    )
}

const MultiPanelTimeseriesPlugin: FigurlPlugin = {
    type: 'seriesview.multipanel-timeseries.2',
    validateData: isMultiPanelTimeseriesData,
    component: MultiPanelTimeseriesComponent
}

export default MultiPanelTimeseriesPlugin