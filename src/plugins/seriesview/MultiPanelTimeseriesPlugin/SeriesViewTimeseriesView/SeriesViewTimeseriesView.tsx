import { FunctionComponent, useMemo } from "react"
import { TimeseriesSelection, TimeseriesSelectionDispatch } from "../interface/TimeseriesSelection"
import useSeriesInfo from "../useSeriesInfo"
import SeriesViewTimeseriesWidget from "./SeriesViewTimeseriesWidget"

interface Props {
    seriesUri: string
    width: number
    height: number
    timeseriesSelection?: TimeseriesSelection
    timeseriesSelectionDispatch?: TimeseriesSelectionDispatch
    hideTimeSpan?: boolean
    hideToolbar?: boolean
    hideBottomBar?: boolean
}

const SeriesViewTimeseriesView: FunctionComponent<Props> = ({seriesUri, timeseriesSelection, timeseriesSelectionDispatch, width, height, hideTimeSpan, hideToolbar, hideBottomBar}) => {
    const {seriesInfo} = useSeriesInfo(seriesUri)

    const y_range: [number, number] = useMemo(() => (seriesInfo ? [seriesInfo.minValue, seriesInfo.maxValue]: [0, 1]), [seriesInfo])

    if (seriesInfo) {
        return (
            <SeriesViewTimeseriesWidget
                seriesInfo={seriesInfo}
                y_range={y_range}
                width={width}
                height={height}
                timeseriesSelection={timeseriesSelection}
                timeseriesSelectionDispatch={timeseriesSelectionDispatch}
                hideTimeSpan={hideTimeSpan}
                hideToolbar={hideToolbar}
                hideBottomBar={hideBottomBar}
            />
        )
    }
    else {
        return (
            <div>Getting series info</div>
        )
    }
}

export default SeriesViewTimeseriesView