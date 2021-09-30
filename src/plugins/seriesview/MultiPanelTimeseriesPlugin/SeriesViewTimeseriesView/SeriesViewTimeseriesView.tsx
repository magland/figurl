import Splitter from 'figurl/labbox-react/components/Splitter/Splitter';
import React, { FunctionComponent, useMemo } from 'react';
import { TimeseriesInfo } from '../interface/TimeseriesInfo';
import { TimeseriesSelection, TimeseriesSelectionDispatch } from '../interface/TimeseriesSelection';
import useTimeseriesInfo from '../useTimeseriesInfo';
import ChannelGeometryView from './ChannelGeometryView';
import SeriesViewTimeseriesWidget from './SeriesViewTimeseriesWidget';
import useTimeseriesData, { TimeseriesData } from './useTimeseriesModel';

interface Props {
    timeseriesUri: string
    width: number
    height: number
    opts: {
        channelSelectPanel?: boolean
    }
    timeseriesSelection?: TimeseriesSelection
    timeseriesSelectionDispatch?: TimeseriesSelectionDispatch
    hideTimeSpan?: boolean
    hideToolbar?: boolean
    hideBottomBar?: boolean
}

// interface TimeseriesInfo {
//     samplerate: number
//     segment_size: number
//     num_channels: number
//     channel_ids: number[]
//     channel_locations: (number[])[]
//     num_timepoints: number
//     y_offsets: number[]
//     y_scale_factor: number
//     initial_y_scale_factor: number
// }

const useValueRangeEstimate = (timeseriesInfo: TimeseriesInfo | undefined, timeseriesData: TimeseriesData | null) => {
    return useMemo(() => {
        if ((!timeseriesData) || (!timeseriesInfo)) return [0, 1]
        const valueRange : [number, number] = [0, 1]
        const channelNames = timeseriesInfo.channelNames
        let first = true
        for (let channelName of channelNames) {
            const a = timeseriesData.getChannelData(channelName, timeseriesInfo.startTime, timeseriesInfo.endTime, 1)
            if (a) {
                const minval = Math.min(...a.values)
                const maxval = Math.max(...a.values)
                if ((first) || (minval < valueRange[0]))
                    valueRange[0] = minval
                if ((first) || (maxval > valueRange[1]))
                    valueRange[1] = maxval
                first = false
            }
        }
        return valueRange
    }, [timeseriesInfo, timeseriesData]) as [number, number]
}

const SeriesViewTimeseriesView: FunctionComponent<Props> = ({timeseriesUri, opts, timeseriesSelection, timeseriesSelectionDispatch, width, height, hideTimeSpan, hideToolbar, hideBottomBar}) => {
    const {timeseriesInfo} = useTimeseriesInfo(timeseriesUri)
    const selectedChannelNames = useMemo(() => (timeseriesSelection?.selectedChannelNames || []), [timeseriesSelection?.selectedChannelNames])
    const visibleChannelNames = useMemo(() => (timeseriesSelection?.visibleChannelNames || timeseriesInfo?.channelNames || []), [timeseriesSelection?.visibleChannelNames, timeseriesInfo?.channelNames])

    const channelNames = useMemo(() => (timeseriesInfo?.channelNames || []), [timeseriesInfo])
    const timeseriesData = useTimeseriesData(timeseriesInfo)

    const y_range = useValueRangeEstimate(timeseriesInfo, timeseriesData)

    if (timeseriesData) {
        return (
            <div>
                <Splitter
                    width={width}
                    height={height}
                    initialPosition={200}
                >
                    {
                        ((opts.channelSelectPanel) && (timeseriesInfo)) ? (
                            <ChannelGeometryView
                                timeseriesInfo={timeseriesInfo}
                                width={0} // filled in above
                                height={0} // filled in above
                                visibleChannelNames={visibleChannelNames}
                                selection={timeseriesSelection}
                                selectionDispatch={timeseriesSelectionDispatch}
                            />
                        ) : undefined
                    }
                    {
                        ((!opts.channelSelectPanel) || (selectedChannelNames.length > 0) || (visibleChannelNames.length <= 12)) ? (
                            <SeriesViewTimeseriesWidget
                                timeseriesData={timeseriesData}
                                channel_names={channelNames}
                                // y_offsets={timeseriesInfo.y_offsets}
                                // y_scale_factor={timeseriesInfo.y_scale_factor * (timeseriesInfo.initial_y_scale_factor || 1)}
                                // y_scale_factor={y_scale_factor}
                                y_range={y_range}
                                width={width} // filled in above
                                height={height} // filled in above
                                visibleChannelNames={opts.channelSelectPanel ? (selectedChannelNames.length > 0 ? selectedChannelNames : visibleChannelNames) : null}
                                timeseriesSelection={timeseriesSelection}
                                timeseriesSelectionDispatch={timeseriesSelectionDispatch}
                                timeseriesType={timeseriesInfo?.type || 'discrete'}
                                hideTimeSpan={hideTimeSpan}
                                hideToolbar={hideToolbar}
                                hideBottomBar={hideBottomBar}
                            />
                        ) : (
                            <div>Select one or more electrodes</div>
                        )
                    }
                </Splitter>
            </div>
        )
    }
    else {
        return (
            <div>Creating timeseries model</div>
        )
    }
}

// const calculateTimeseriesInfo = async (recordingObject: RecordingObject, hither: HitherInterface): Promise<TimeseriesInfo> => {
//     let info: TimeseriesInfo
//     try {
//         info = await hither.createHitherJob(
//             'createjob_calculate_timeseries_info',
//             { recording_object: recordingObject },
//             {
//                 useClientCache: true
//             }
//         ).wait() as TimeseriesInfo
//     }
//     catch (err) {
//         console.error(err);
//         throw Error('Problem calculating timeseries info.')
//     }
//     if (!info) {
//         throw Error('Unexpected problem calculating timeseries info: info is null.')
//     }
//     return info
// }

export default SeriesViewTimeseriesView