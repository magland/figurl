import CanvasWidget from 'figurl/labbox-react/components/CanvasWidget';
import { useLayer, useLayers } from 'figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { createClusterViewMainLayer, LayerProps } from './clusterViewMainLayer';

export type PointGroup = {
    key: string
    locations: {x: number, y: number}[]
}

type Props = {
    xRange: [number, number]
    yRange: [number, number]
    pointGroups: PointGroup[]
    selectedPointGroups: string[]
    setSelectedPointGroups: (x: string[]) => void
    xLabel: string
    yLabel: string
    width: number
    height: number
}

const ClusterWidget: FunctionComponent<Props> = ({pointGroups, selectedPointGroups, setSelectedPointGroups, xRange, yRange, xLabel, yLabel, width, height}) => {
    const [hoveredPointGroup, setHoveredPointGroup] = useState<string>('')
    const handleClickPointGroup = useCallback((key: string) => {
        if (key) setSelectedPointGroups([key])
        else setSelectedPointGroups([])
    }, [setSelectedPointGroups])
    const layerProps: LayerProps = useMemo(() => ({
        pointGroups,
        selectedPointGroups,
        hoveredPointGroup,
        onHoverPointGroup: setHoveredPointGroup,
        onClickPointGroup: handleClickPointGroup,
        xRange,
        yRange,
        width,
        height,
    }), [pointGroups, hoveredPointGroup, setHoveredPointGroup, handleClickPointGroup, selectedPointGroups, xRange, yRange, width, height])
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