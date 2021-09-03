import { RecordingSelectionDispatch } from 'plugins/sortingview/gui/pluginInterface'
import { FaArrowDown, FaArrowUp, FaRegTimesCircle } from 'react-icons/fa'
import { ToolbarItem } from '../Toolbars'

interface AmplitudeScaleToolbarProps {
    selectionDispatch: RecordingSelectionDispatch
    ampScaleFactor: number
}


const AmplitudeScaleToolbarEntries = (props: AmplitudeScaleToolbarProps): ToolbarItem[] => {
    const { selectionDispatch, ampScaleFactor } = props
    const _handleScaleAmplitudeUp = () => selectionDispatch({type: 'ScaleAmpScaleFactor', direction: 'up'})
    const _handleScaleAmplitudeDown = () => selectionDispatch({type: 'ScaleAmpScaleFactor', direction: 'down'})
    const _handleResetAmplitude = () => selectionDispatch({type: 'SetAmpScaleFactor', ampScaleFactor: 1})

    return [
        {
            type: 'button',
            callback: _handleScaleAmplitudeUp,
            title: 'Scale amplitude up [up arrow]',
            icon: <FaArrowUp />,
            keyCode: 38
        },
        {
            type: 'button',
            callback: _handleResetAmplitude,
            title: 'Reset scale amplitude',
            icon: <FaRegTimesCircle />
        },
        {
            type: 'button',
            callback: _handleScaleAmplitudeDown,
            title: 'Scale amplitude down [down arrow]',
            icon: <FaArrowDown />,
            keyCode: 40
        },
        {
            type: 'text',
            title: 'Zoom level',
            content: ampScaleFactor,
            contentSigFigs: 2
        }
    ]
}

export default AmplitudeScaleToolbarEntries