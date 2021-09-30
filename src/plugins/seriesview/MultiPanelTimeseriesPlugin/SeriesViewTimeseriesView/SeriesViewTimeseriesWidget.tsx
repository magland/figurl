import { ChannelName } from 'commonInterface/kacheryTypes'
import { sleepMsecNum } from 'commonInterface/util/util'
import { runPureCalculationTaskAsync, useChannel, useKacheryNode } from 'figurl/kachery-react'
import { CanvasPainter } from 'figurl/labbox-react/components/CanvasWidget/CanvasPainter'
import { Vec2 } from 'figurl/labbox-react/components/CanvasWidget/Geometry'
import KacheryNode from 'kacheryInterface/core/KacheryNode'
import seriesviewTaskFunctionIds from 'plugins/seriesview/seriesviewTaskFunctionIds'
import useBufferedDispatch from 'plugins/sortingview/gui/extensions/common/useBufferedDispatch'
import { TimeWidgetAction } from 'plugins/sortingview/gui/extensions/timeseries/TimeWidgetNew/TimeWidgetNew'
import React, { useCallback, useMemo } from 'react'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'
import { SeriesInfo } from '../interface/SeriesInfo'
import { TimeseriesSelection, TimeseriesSelectionDispatch, timeseriesSelectionReducer } from '../interface/TimeseriesSelection'
import SeriesViewTimeWidget from '../SeriesViewTimeWidget/SeriesViewTimeWidget'
// import TimeseriesModelNew from './TimeseriesModelNew'

interface Props {
    seriesInfo: SeriesInfo
    y_range: [number, number]
    width: number
    height: number
    timeseriesSelection?: TimeseriesSelection
    timeseriesSelectionDispatch?: TimeseriesSelectionDispatch
    hideTimeSpan?: boolean
    hideToolbar?: boolean
    hideBottomBar?: boolean
}

// const channelColors = [
//     'rgb(80,80,80)',
//     'rgb(104,42,42)',
//     'rgb(42,104,42)',
//     'rgb(42,42,152)'
// ]

export class ArrayFetcher {
    #arrays: {[uri: string]: number[]} = {}
    #status: {[uri: string]: string} = {}
    constructor(private kacheryNode: KacheryNode, private channelName: ChannelName, private backendId: string | null) {

    }
    fetch(uri: string, dtype: string) {
        if (this.#arrays[uri]) return this.#arrays[uri]
        const s = this.#status[uri] || ''
        if (s) return undefined
        this.#status[uri] = 'started'
        ;(async () => {
            const result = await runPureCalculationTaskAsync<{array: number[]}>(
                this.kacheryNode,
                seriesviewTaskFunctionIds.seriesViewGetArray,
                {
                    uri,
                    dtype
                },
                {channelName: this.channelName, backendId: this.backendId}
            )
            this.#status[uri] = 'finished'
            this.#arrays[uri] = result.array
        })()
    }
}

class Timer {
    #started = Date.now()
    reset() {
        this.#started = Date.now()
    }
    elapsed() {
        return Date.now() - this.#started
    }
}


class Panel {
    // _updateHandler: (() => void) | null = null
    _timeRange: {min: number, max: number} | null = null
    _yScale: number = 1
    _pixelWidth: number | null = null // for determining the downsampling factor
    constructor(private panelLabel: string, private seriesInfo: SeriesInfo, private arrayFetcher: ArrayFetcher, private y_range: [number, number]) {
        
    }
    setTimeRange(timeRange: {min: number, max: number}) {
        this._timeRange = timeRange
    }
    setYScale(s: number) {
        if (this._yScale === s) return
        this._yScale = s
    }
    setPixelWidth(w: number) {
        if (this._pixelWidth === w) return
        this._pixelWidth = w
    }
    async paint(painter: CanvasPainter, valid: () => boolean) {
        console.log('------------::::::::::: paint', this.seriesInfo.numSamples)
        const timeRange = this._timeRange
        if (!timeRange) return

        const segments = this.seriesInfo.manifest.segments.filter(s => (
            (timeRange.min < s.end_time) && (timeRange.max > s.start_time)
        ))
        while (true) { // loop until we have gotten all the data
            console.log('--- a1', this.seriesInfo.numSamples, valid())
            if (!valid()) return
            console.log('--- a2', this.seriesInfo.numSamples)
            let gotAllData = true
            const markers: {
                x: number,
                y: number,
                p: Vec2,
                density: number
            }[] = []
            console.log('--- a3', this.seriesInfo.numSamples)
            for (let s of segments) {
                const R = {xmin: s.start_time, xmax: s.end_time, ymin: 0, ymax: 1}
                painter.drawRect(R, {color: 'rgb(200,200,200)'})
                const timestamps = this.arrayFetcher.fetch(s.timestamps_uri, s.timestamps_dtype)
                const values = this.arrayFetcher.fetch(s.values_uri, s.values_dtype)
                if ((timestamps) && (values)) {
                    for (let ii = 0; ii < timestamps.length; ii ++) {
                        const t = timestamps[ii]
                        const v = values[ii]
                        const v2 = (v - this.y_range[0]) / (this.y_range[1] - this.y_range[0])
                        markers.push({x: t, y: v2, p: painter.transformPointToPixels([t, v2]), density: 0})
                    }
                }
                else gotAllData = false
            }
            const radius = 4
            for (let ii = 0; ii < markers.length; ii ++) {
                let jj = ii + 1
                while (jj < markers.length) {
                    const dx = Math.abs(markers[jj].p[0] - markers[ii].p[0])
                    const dy = Math.abs(markers[jj].p[1] - markers[ii].p[1])
                    if (dx < radius) {
                        if (dy < radius) {
                            markers[ii].density ++
                            markers[jj].density ++
                        }
                    }
                    else break
                    jj ++
                }
            }
            const maxDensity = Math.max(...markers.map(m => (m.density)))
            const stride = 50
            const timer = new Timer()
            for (let offset = 0; offset < stride; offset++) {
                for (let i = offset; i < markers.length; i += stride) {
                    const marker = markers[i]
                    const v = marker.density / maxDensity * 255
                    const color = `rgb(${v}, ${v}, 0)`
                    const pen = {color, width: 1}
                    const brush = {color}
                    painter.drawMarker([marker.x, marker.y], {radius, pen, brush})
                }
                if (timer.elapsed() > 150) {
                    timer.reset()
                    await sleepMsecNum(1)
                    if (!valid()) return
                }
            }
            console.log('--- a5', this.seriesInfo.numSamples)
            if (gotAllData) {
                console.log('--- got all the data', markers.length, this.seriesInfo.numSamples)
                break
            }
            else {
                console.log('--- did not get all the data', this.seriesInfo.numSamples)
                await sleepMsecNum(100)
            }
            console.log('--- b', this.seriesInfo.numSamples)
        }
    }
    label() {
        return this.panelLabel
    }
}

const SeriesViewTimeseriesWidget = (props: Props) => {
    const { seriesInfo, width, height, y_range, timeseriesSelection: externalSelection, timeseriesSelectionDispatch: externalSelectionDispatch, hideTimeSpan, hideToolbar, hideBottomBar } = props
    const [timeseriesSelection, timeseriesSelectionDispatch] = useBufferedDispatch(timeseriesSelectionReducer, externalSelection || {}, useMemo(() => ((state: TimeseriesSelection) => {externalSelectionDispatch && externalSelectionDispatch({type: 'Set', state})}), [externalSelectionDispatch]), 200)
    
    const _handleScaleAmplitudeUp = useCallback(() => {
        timeseriesSelectionDispatch({type: 'ScaleAmpScaleFactor', direction: 'up'})
    }, [timeseriesSelectionDispatch])
    const _handleScaleAmplitudeDown = useCallback(() => {
        timeseriesSelectionDispatch({type: 'ScaleAmpScaleFactor', direction: 'down'})
    }, [timeseriesSelectionDispatch])

    const kacheryNode = useKacheryNode()
    const {channelName, backendId} = useChannel()

    const arrayFetcher = useMemo(() => {
        return new ArrayFetcher(kacheryNode, channelName, backendId)
    }, [kacheryNode, channelName, backendId])

    const panels = useMemo(() => {
        const p = new Panel('', seriesInfo, arrayFetcher, y_range)
        p.setPixelWidth(width)
        p.setYScale(timeseriesSelection.ampScaleFactor || 1)
        return [p]
    }, [seriesInfo, timeseriesSelection.ampScaleFactor, width, y_range, arrayFetcher])
    const actions = useMemo(() => {
        const a: TimeWidgetAction[] = [
            {
                type: 'button',
                callback: _handleScaleAmplitudeUp,
                title: 'Scale amplitude up [up arrow]',
                icon: <FaArrowUp />,
                keyCode: 38
            },
            {
                type: 'button',
                callback: _handleScaleAmplitudeDown,
                title: 'Scale amplitude down [down arrow]',
                icon: <FaArrowDown />,
                keyCode: 40
            },
            {
                type: 'divider'
            }
        ]
        return a
    }, [_handleScaleAmplitudeUp, _handleScaleAmplitudeDown])

    // const numTimepoints = useMemo(() => (timeseriesData ? timeseriesData.numTimepoints() : 0), [timeseriesData])

    return (
        <SeriesViewTimeWidget
            panels={panels}
            customActions={actions}
            width={width}
            height={height}
            samplerate={seriesInfo.samplingFrequency}
            startTimeSpan={1e5 / seriesInfo.samplingFrequency}
            maxTimeSpan={1e5 / seriesInfo.samplingFrequency}
            timeseriesStartTime={seriesInfo.startTime}
            timeseriesEndTime={seriesInfo.endTime}
            selection={timeseriesSelection}
            selectionDispatch={timeseriesSelectionDispatch}
            hideTimeSpan={hideTimeSpan}
            hideToolbar={hideToolbar}
            hideBottomBar={hideBottomBar}
        />
    )
}

export default SeriesViewTimeseriesWidget