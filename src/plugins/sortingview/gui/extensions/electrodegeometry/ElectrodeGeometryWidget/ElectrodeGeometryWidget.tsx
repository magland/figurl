import CanvasWidget, { useLayer, useLayers } from "figurl/labbox-react/components/CanvasWidget"
import React, { useMemo } from "react"
import { RecordingSelectionDispatch } from "../../../pluginInterface"
import { createElectrodesLayer, Electrode, ElectrodeLayerProps } from "../../common/sharedCanvasLayers/electrodesLayer"
import setupElectrodes from '../../common/sharedCanvasLayers/setupElectrodes'
import ElectrodeGeometry from '../../common/sharedDrawnComponents/ElectrodeGeometry'

// Okay, so after some hoop-jumping, we've learned the RecordingInfo has:
// - sampling frequency (number), - channel_ids (list of number),
// - channel_groups (list of number), - geom (list of Vec2),
// - num_frames (number), - is_local (boolean).

interface WidgetProps {
    electrodes: Electrode[] // Note: these shouldn't be interacted with directly. Use the bounding boxes in the state, instead.
    selectedElectrodeIds: number[]
    selectionDispatch: RecordingSelectionDispatch
    width: number
    height: number
}

const defaultElectrodeLayerElectrodeOpts = {
    showLabels: true,
    maxElectrodePixelRadius: 25
}

const useNewStyle = true

const ElectrodeGeometryWidget = (props: WidgetProps) => {
    const layoutMode = 'geom'
    const electrodeIds = useMemo(() => {
        return props.electrodes.map((e) => e.id)
    }, [props.electrodes])
    const electrodeLocations = useMemo(() => {
        return props.electrodes.map((e) => [e.x, e.y])
    }, [props.electrodes])
    const electrodesSetup = useMemo(() => {
        return setupElectrodes({
            width: props.width,
            height: props.height,
            electrodeLocations: electrodeLocations,
            electrodeIds: electrodeIds,
            layoutMode: layoutMode})
    }, [props.width, props.height, electrodeLocations, electrodeIds, layoutMode])

    const electrodeLayerProps: ElectrodeLayerProps = useMemo(() => ({
        electrodeBoxes: electrodesSetup.electrodeBoxes,
        transform: electrodesSetup.transform,
        radius: electrodesSetup.radius,
        pixelRadius: electrodesSetup.pixelRadius,
        layoutMode: layoutMode,
        width: props.width,
        height: props.height,
        selectedElectrodeIds: props.selectedElectrodeIds ?? [],
        selectionDispatch: props.selectionDispatch,
        electrodeOpts: defaultElectrodeLayerElectrodeOpts,
        noiseLevel: 0, // not needed for electrode geometry
        samplingFrequency: 0 // not needed
    }), [props, electrodesSetup])

    const layer = useLayer(createElectrodesLayer, electrodeLayerProps)
    const layers = useLayers([layer])
    return useNewStyle ?
    (
        <ElectrodeGeometry
            electrodes={props.electrodes}
            selectedElectrodeIds={props.selectedElectrodeIds}
            selectionDispatch={props.selectionDispatch}
            width={props.width}
            height={props.height}
            layoutMode={'geom'}
            showLabels={true}
            maxElectrodePixelRadius={25}
        />
    )
    : (
        <CanvasWidget
            key='electrodeGeometryCanvas'
            layers={layers}
            {...{width: props.width, height: props.height}}
        />
    )
}


export default ElectrodeGeometryWidget