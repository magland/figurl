
import { FaArrowLeft, FaArrowRight, FaSearchMinus, FaSearchPlus } from 'react-icons/fa'
import { ToolbarItem } from '../Toolbars'

interface TimeWidgetToolbarEntryProps {
    onZoomIn: () => void
    onZoomOut: () => void
    onShiftTimeLeft: () => void
    onShiftTimeRight: () => void
}

const TimeWidgetToolbarEntries = (props: TimeWidgetToolbarEntryProps): ToolbarItem[] => {
    return [
        {
            type: 'button',
            title: "Time zoom in (+)",
            callback: props.onZoomIn,
            icon: <FaSearchPlus />
        },
        {
            type: 'button',
            title: "Time zoom out (-)",
            callback: props.onZoomOut,
            icon: <FaSearchMinus />
        },
        {
            type: 'button',
            title: "Shift time left [left arrow]",
            callback: props.onShiftTimeLeft,
            icon: <FaArrowLeft />
        },
        {
            type: 'button',
            title: "Shift time right [right arrow]",
            callback: props.onShiftTimeRight,
            icon: <FaArrowRight />
        }
    ]
}

export default TimeWidgetToolbarEntries
