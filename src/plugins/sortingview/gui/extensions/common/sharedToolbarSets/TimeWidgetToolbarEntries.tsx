
import { TimeseriesSelectionDispatch } from 'plugins/sortingview/ExperitimeTimeseriesPlugin/interface/TimeseriesSelection'
import { RecordingSelectionDispatch } from 'plugins/sortingview/gui/pluginInterface'
import { FaArrowLeft, FaArrowRight, FaSearchMinus, FaSearchPlus } from 'react-icons/fa'
import { ToolbarItem } from '../Toolbars'

interface TimeWidgetToolbarEntryProps {
    selectionDispatch: RecordingSelectionDispatch | TimeseriesSelectionDispatch
}

const TimeWidgetToolbarEntries = (props: TimeWidgetToolbarEntryProps): ToolbarItem[] => {
    const { selectionDispatch } = props
    const handleZoomTimeIn = () => selectionDispatch({type: 'ZoomTimeRange', direction: 'in'})

    const handleZoomTimeOut = () => selectionDispatch({type: 'ZoomTimeRange', direction: 'out'})

    const handleShiftTimeLeft = () => selectionDispatch({type: 'TimeShiftFrac', frac: -0.2})

    const handleShiftTimeRight = () => selectionDispatch({type: 'TimeShiftFrac', frac: 0.2})

    return [
        {
            type: 'button',
            title: "Time zoom in (+)",
            callback: handleZoomTimeIn,
            icon: <FaSearchPlus />
        },
        {
            type: 'button',
            title: "Time zoom out (-)",
            callback: handleZoomTimeOut,
            icon: <FaSearchMinus />
        },
        {
            type: 'button',
            title: "Shift time left [left arrow]",
            callback: handleShiftTimeLeft,
            icon: <FaArrowLeft />
        },
        {
            type: 'button',
            title: "Shift time right [right arrow]",
            callback: handleShiftTimeRight,
            icon: <FaArrowRight />
        }
    ]
}

export default TimeWidgetToolbarEntries
