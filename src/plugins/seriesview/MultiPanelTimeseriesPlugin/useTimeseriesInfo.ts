import { useChannel, usePureCalculationTask } from "figurl/kachery-react";
import sortingviewTaskFunctionIds from "../seriesviewTaskFunctionIds";
import { TimeseriesInfo } from "./interface/TimeseriesInfo";

const useTimeseriesInfo = (timeseriesUri: string) => {
    const {channelName} = useChannel()
    const {returnValue: timeseriesInfo, task} = usePureCalculationTask<TimeseriesInfo>(
        timeseriesUri ? sortingviewTaskFunctionIds.seriesViewGetTimeseriesInfo : undefined,
        {timeseries_uri: timeseriesUri},
        {channelName}
    )
    return {timeseriesInfo, task}
}

export default useTimeseriesInfo