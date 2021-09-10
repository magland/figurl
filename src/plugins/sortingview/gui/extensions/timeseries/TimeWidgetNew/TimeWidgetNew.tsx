import CanvasWidget, { useLayer, useLayers } from 'figurl/labbox-react/components/CanvasWidget'
import { CanvasPainter } from 'figurl/labbox-react/components/CanvasWidget/CanvasPainter'
import ViewToolbar from 'plugins/sortingview/gui/extensions/common/ViewToolbar'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { RecordingSelection, RecordingSelectionDispatch } from '../../../pluginInterface'
import TimeWidgetToolbarEntries from '../../common/sharedToolbarSets/TimeWidgetToolbarEntries'
import { ActionItem, Divider, DividerItem, TextItem, ToggleableItem } from '../../common/Toolbars'
import { createCursorLayer } from './cursorLayer'
import { createMainLayer } from './mainLayer'
import { createMarkersLayer } from './markersLayer'
import { createPanelLabelLayer } from './panelLabelLayer'
import { createTimeAxisLayer } from './timeAxisLayer'
import TimeSpanWidget, { SpanWidgetInfo } from './TimeSpanWidget'
import TimeWidgetBottomBar from './TimeWidgetBottomBar'

export type TimeWidgetAction = ActionItem | ToggleableItem | DividerItem | TextItem

interface Props {
    panels: TimeWidgetPanel[]
    customActions?: TimeWidgetAction[] | null
    width: number
    height: number
    samplerate: number
    maxTimeSpan: number
    startTimeSpan: number
    numTimepoints: number
    selection: RecordingSelection
    selectionDispatch: RecordingSelectionDispatch
    markers?: {t: number, color: string}[]
}

export interface TimeWidgetPanel {
    setTimeRange: (timeRange: {min: number, max: number}) => void
    paint: (painter: CanvasPainter, completenessFactor: number) => void
    paintYAxis?: (painter: CanvasPainter, width: number, height: number) => void
    label: () => string
}

const toolbarWidth = 36 // hard-coded for now
const spanWidgetHeight = 40

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TimeState {
    numTimepoints: number
    maxTimeSpan: number
    currentTime: number | null
    timeRange: {min: number, max: number} | null
}
interface ZoomTimeRangeAction {
    type: 'zoomTimeRange'
    factor: number
}
interface SetTimeRangeAction {
    type: 'setTimeRange'
    timeRange: {min: number, max: number}
}
interface TimeShiftFrac {
    type: 'timeShiftFrac',
    frac: number
}
interface SetCurrentTime {
    type: 'setCurrentTime'
    currentTime: number | null
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type TimeAction = ZoomTimeRangeAction | SetTimeRangeAction | TimeShiftFrac | SetCurrentTime | {type: 'gotoHome' | 'gotoEnd'}

const plotMargins = {
    left: 80,
    top: 20,
    right: 40,
    bottom: 60
}

const TimeWidgetNew = (props: Props) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {panels, width, height, customActions, numTimepoints, maxTimeSpan, startTimeSpan, samplerate, selection, selectionDispatch, markers} = props

    const [spanWidgetInfo, setSpanWidgetInfo] = useState<SpanWidgetInfo>({numTimepoints})

    const mainLayer = useLayer(createMainLayer)
    const timeAxisLayer = useLayer(createTimeAxisLayer)
    const panelLabelLayer = useLayer(createPanelLabelLayer)
    const markersLayer = useLayer(createMarkersLayer)
    const cursorLayer = useLayer(createCursorLayer)

    const allLayers = useLayers([mainLayer, timeAxisLayer, panelLabelLayer, markersLayer, cursorLayer])

    // schedule repaint when panels change
    useEffect(() => {
        if (mainLayer) {
            mainLayer.scheduleRepaint()
        }
    }, [panels, mainLayer])

    // when current time or time range changes, update the span widget info
    useEffect(() => {
        setSpanWidgetInfo({
            currentTime: selection.currentTimepoint,
            timeRange: selection.timeRange,
            numTimepoints
        })
    }, [selection.currentTimepoint, selection.timeRange, setSpanWidgetInfo, numTimepoints])

    // when time range or panels change, repaint all layers
    useEffect(() => {
        allLayers.forEach(layer => {
            layer && layer.scheduleRepaint()
        })
    }, [panels, allLayers])

    const handleClick = useCallback(
        (args: {timepoint: number, panelIndex: number, y: number}) => {
            selectionDispatch({type: 'SetCurrentTimepoint', currentTimepoint: args.timepoint})
        },
        [selectionDispatch]
    )
    const handleDrag = useCallback(
        (args: {newTimeRange: {min: number, max: number}}) => {
            selectionDispatch({type: 'SetTimeRange', timeRange: args.newTimeRange})
        },
        [selectionDispatch]
    )
    const handleTimeZoom = useCallback((a: {direction: 'in' | 'out'}) => {
        selectionDispatch({type: 'ZoomTimeRange', direction: a.direction})
    }, [selectionDispatch])

    const handleTimeShiftFrac = useCallback((frac: number) => {
        selectionDispatch({type: 'TimeShiftFrac', frac})
    }, [selectionDispatch])

    const handleCurrentTimeChanged = useCallback((t: number | null) => {
        selectionDispatch({type: 'SetCurrentTimepoint', currentTimepoint: t})
    }, [selectionDispatch])

    const handleTimeRangeChanged = useCallback((timeRange: {min: number, max: number}) => {
        selectionDispatch({type: 'SetTimeRange', timeRange})
    }, [selectionDispatch])

    const handleGotoHome = useCallback(() => {
        // selectionDispatch({type: 'CurrentTimepointHome'})
    }, [])

    const handleGotoEnd = useCallback(() => {
        // selectionDispatch({type: 'CurrentTimepointEnd'})
    }, [])

    const handleRepaintTimeEstimate = useCallback((ms: number) => {
        const refreshRateEstimate = 1000 / ms
        const refreshRate = refreshRateEstimate / 2
        allLayers.forEach(layer => {
            layer && layer.setRefreshRate(refreshRate)
        })
    }, [allLayers])

    const bottomBarInfo = {
        show: true,
        currentTime: selection.currentTimepoint,
        timeRange: selection.timeRange,
        samplerate,
        statusText: ''
    }
    const showBottomBar = true
    const bottomBarHeight = showBottomBar ? 40 : 0;

    const timeToolbar = useMemo(() => TimeWidgetToolbarEntries({selectionDispatch: selectionDispatch}), [selectionDispatch])
    const actions = useMemo(() => ([
        ...timeToolbar,
        Divider,
        ...customActions || []
    ]), [customActions, timeToolbar])

    const layerProps = {
        customActions,
        panels,
        width: width - toolbarWidth,
        height: height - spanWidgetHeight - bottomBarHeight,
        timeRange: selection.timeRange,
        currentTime: selection.currentTimepoint,
        samplerate,
        margins: plotMargins,
        onClick: handleClick,
        onDrag: handleDrag,
        onTimeZoom: handleTimeZoom,
        onTimeShiftFrac: handleTimeShiftFrac,
        onGotoHome: handleGotoHome,
        onGotoEnd: handleGotoEnd,
        onRepaintTimeEstimate: handleRepaintTimeEstimate,
        markers
    }
    allLayers.forEach(L => {
        if (L) L.setProps(layerProps)
    })

    return (
        <div
            className="TimeWidget"
            style={{position: 'relative', left: 0, top: 0, width, height}}
        >
            <ViewToolbar
                width={toolbarWidth}
                height={height}
                top={0}
                customActions={actions}
            />
            <div
                style={{position: 'relative', left: toolbarWidth, top: 0, width: width - toolbarWidth, height: height}}
            >
                <TimeSpanWidget
                    key='timespan'
                    width={width - toolbarWidth}
                    height={spanWidgetHeight}
                    info={spanWidgetInfo}
                    onCurrentTimeChanged={handleCurrentTimeChanged}
                    onTimeRangeChanged={handleTimeRangeChanged}
                />
                <CanvasWidget
                    key='canvas'
                    layers={allLayers}
                    preventDefaultWheel={true}
                    {...{width: width - toolbarWidth, height: layerProps.height}}
                />
                <TimeWidgetBottomBar
                    key='bottom'
                    width={width - toolbarWidth}
                    height={bottomBarHeight}
                    info={bottomBarInfo}
                    onCurrentTimeChanged={handleCurrentTimeChanged}
                    onTimeRangeChanged={handleTimeRangeChanged}
                />
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const shiftTimeRange = (timeRange: {min: number, max: number}, shift: number): {min: number, max: number} => {
    return {
        min: Math.floor(timeRange.min + shift),
        max: Math.floor(timeRange.max + shift)
    }
}

export default TimeWidgetNew