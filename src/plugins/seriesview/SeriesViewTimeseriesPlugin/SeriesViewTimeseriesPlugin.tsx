import { isJSONObject, _validateObject } from "commonInterface/kacheryTypes";
import { JSONObject } from "commonInterface/util/misc";
import { useChannel, usePureCalculationTask } from "figurl/kachery-react";
import TaskStatusView from "figurl/kachery-react/components/TaskMonitor/TaskStatusView";
import { FigurlPlugin } from "figurl/types";
import { FunctionComponent, useEffect, useReducer } from "react";
import sortingviewTaskFunctionIds from "../seriesviewTaskFunctionIds";
import { TimeseriesInfo } from "./interface/TimeseriesInfo";
import { timeseriesSelectionReducer } from "./interface/TimeseriesSelection";
import SeriesViewTimeseriesView from "./SeriesViewTimeseriesView/SeriesViewTimeseriesView";

type SeriesViewTimeseriesData = {
    timeseriesObject: JSONObject
}
const isSeriesViewTimeseriesData = (x: any): x is SeriesViewTimeseriesData => {
    return _validateObject(x, {
        timeseriesObject: isJSONObject
    })
}

type Props = {
    data: SeriesViewTimeseriesData
    width: number
    height: number
}

const useTimeseriesInfo = (timeseriesObject: JSONObject) => {
    const {channelName} = useChannel()
    const {returnValue: timeseriesInfo, task} = usePureCalculationTask<TimeseriesInfo>(
        timeseriesObject ? sortingviewTaskFunctionIds.seriesViewGetTimeseriesInfo : undefined,
        {timeseries_object: timeseriesObject},
        {channelName}
    )
    return {timeseriesInfo, task}
}

const SeriesViewTimeseriesComponent: FunctionComponent<Props> = ({data, width, height}) => {
    const {timeseriesObject} = data
    const {timeseriesInfo, task} = useTimeseriesInfo(timeseriesObject)
    const [timeseriesSelection, timeseriesSelectionDispatch] = useReducer(timeseriesSelectionReducer, {})
    useEffect(() => {
        if (!timeseriesInfo) return
        timeseriesSelectionDispatch({
            type: 'SetTimeRange',
            timeRange: {min: timeseriesInfo.startTime, max: timeseriesInfo.endTime}
        })
    }, [timeseriesInfo])
    if (!timeseriesInfo) return (
        <TaskStatusView task={task} label="Loading timeseries info" />
    )
    return (
        <SeriesViewTimeseriesView
            timeseriesInfo={timeseriesInfo}
            width={width}
            height={height}
            opts={{channelSelectPanel: true}}
            timeseriesSelection={timeseriesSelection}
            timeseriesSelectionDispatch={timeseriesSelectionDispatch}
        />
    )
}

const SeriesViewTimeseriesPlugin: FigurlPlugin = {
    type: 'seriesview.timeseries.2',
    validateData: isSeriesViewTimeseriesData,
    component: SeriesViewTimeseriesComponent
}

export default SeriesViewTimeseriesPlugin