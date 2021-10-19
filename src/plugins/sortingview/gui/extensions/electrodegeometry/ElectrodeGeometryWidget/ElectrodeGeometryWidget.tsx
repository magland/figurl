import { RecordingSelectionDispatch } from "../../../pluginInterface"
import ElectrodeGeometry, { defaultMaxPixelRadius, Electrode } from '../../common/sharedDrawnComponents/ElectrodeGeometry'

interface WidgetProps {
    electrodes: Electrode[]
    selectedElectrodeIds: number[]
    selectionDispatch: RecordingSelectionDispatch
    width: number
    height: number
}

const ElectrodeGeometryWidget = (props: WidgetProps) => {
    return (
        <ElectrodeGeometry
            electrodes={props.electrodes}
            selectedElectrodeIds={props.selectedElectrodeIds}
            selectionDispatch={props.selectionDispatch}
            width={props.width}
            height={props.height}
            layoutMode={'geom'}
            showLabels={true}
            maxElectrodePixelRadius={defaultMaxPixelRadius}
            disableSelection={false}
            // offsetLabels={true}
        />
    )
}


export default ElectrodeGeometryWidget