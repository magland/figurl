import CanvasWidget from 'figurl/labbox-react/components/CanvasWidget';
import { useLayer, useLayers } from 'figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer';
import React, { FunctionComponent, useMemo } from 'react';
import { createClusterViewMainLayer, LayerProps } from './clusterViewMainLayer';

type Props = {
    xRange: [number, number]
    yRange: [number, number]
    xFeatures: number[]
    yFeatures: number[]
    highlighted: boolean[]
    xLabel: string
    yLabel: string
}

const ClusterWidget: FunctionComponent<Props> = ({xFeatures, yFeatures, highlighted, xRange, yRange, xLabel, yLabel}) => {
    const layerProps: LayerProps = useMemo(() => ({
        xFeatures,
        yFeatures,
        highlighted,
        xRange,
        yRange,
        width: 400,
        height: 400
    }), [xFeatures, yFeatures, highlighted, xRange, yRange])
    const mainLayer = useLayer(createClusterViewMainLayer, layerProps)
    const layers = useLayers([mainLayer])
    return (
        <CanvasWidget
            layers={layers}
            {...{width: layerProps.width, height: layerProps.height}}
        />
    )
}

export default ClusterWidget