import CanvasWidget from 'figurl/labbox-react/components/CanvasWidget';
import { useLayer, useLayers } from 'figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer';
import React, { FunctionComponent, useMemo } from 'react';
import { createClusterViewMainLayer, LayerProps } from './clusterViewMainLayer';

type Props = {
    features: number[][]
    xIndex: number
    yIndex: number
    xLabel: string
    yLabel: string
}

const SpikeClusterView: FunctionComponent<Props> = ({features, xIndex, yIndex, xLabel, yLabel}) => {
    const xFeatures = useMemo(() => (
        features.map(a => (a[xIndex]))
    ), [features, xIndex])
    const yFeatures = useMemo(() => (
        features.map(a => (a[yIndex]))
    ), [features, yIndex])
    const {xRange, yRange} = useMemo(() => {
        const xMin = Math.min(...xFeatures)
        const xMax = Math.max(...xFeatures)
        const yMin = Math.min(...yFeatures)
        const yMax = Math.max(...yFeatures)
        const xRange: [number, number] = [xMin, xMax]
        const yRange: [number, number] = [yMin, yMax]
        return {xRange, yRange}
    }, [xFeatures, yFeatures])
    const layerProps: LayerProps = useMemo(() => ({
        xFeatures,
        yFeatures,
        xRange,
        yRange,
        width: 400,
        height: 400
    }), [xFeatures, yFeatures, xRange, yRange])
    console.log('----', xFeatures, yFeatures, xRange, yRange)
    const mainLayer = useLayer(createClusterViewMainLayer, layerProps)
    const layers = useLayers([mainLayer])
    return (
        <CanvasWidget
            layers={layers}
            {...{width: layerProps.width, height: layerProps.height}}
        />
    )
}

export default SpikeClusterView