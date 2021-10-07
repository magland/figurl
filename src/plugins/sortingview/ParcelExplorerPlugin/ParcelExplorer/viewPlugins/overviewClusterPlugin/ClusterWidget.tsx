import CanvasWidget from 'figurl/labbox-react/components/CanvasWidget';
import { ClickEventModifiers, useLayer, useLayers } from 'figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { createClusterViewMainLayer, LayerProps } from './clusterViewMainLayer';

export type PointGroup = {
    key: string
    locations: {x: number, y: number}[]
    color: string
}

type Props = {
    xRange?: [number, number]
    yRange?: [number, number]
    pointGroups: PointGroup[]
    selectedPointGroups?: string[]
    setSelectedPointGroups?: (x: string[]) => void
    onClickPoint?: (p: {pointGroupKey: string, pointIndex: number}) => void
    xLabel: string
    yLabel: string
    width: number
    height: number
    pointRadius: number
    useDensityColor: boolean
}

const ClusterWidget: FunctionComponent<Props> = ({pointGroups, selectedPointGroups, setSelectedPointGroups, onClickPoint, xRange, yRange, xLabel, yLabel, width, height, pointRadius, useDensityColor}) => {
    const [hoveredPointGroup, setHoveredPointGroup] = useState<string>('')
    const handleClickPointGroup = useCallback((key: string, modifiers: ClickEventModifiers) => {
        if (!selectedPointGroups) return
        if (!setSelectedPointGroups) return
        if (key) {
            if (modifiers.ctrl) {
                if (selectedPointGroups.includes(key)) setSelectedPointGroups(selectedPointGroups.filter(k => (k !== key)))
                else setSelectedPointGroups([...selectedPointGroups, key])
            }
            else {
                setSelectedPointGroups([key])
            }
        }
        else setSelectedPointGroups([])
    }, [selectedPointGroups, setSelectedPointGroups])
    const {xRange2, yRange2} = useMemo(() => {
        if ((xRange) && (yRange)) {
            return {xRange2: xRange, yRange2: yRange}
        }
        else {
            const xmins: number[] = []
            const xmaxs: number[] = []
            const ymins: number[] = []
            const ymaxs: number[] = []
            for (let G of pointGroups) {
                xmins.push(Math.min(...G.locations.map(a => (a.x))))
                xmaxs.push(Math.max(...G.locations.map(a => (a.x))))
                ymins.push(Math.min(...G.locations.map(a => (a.y))))
                ymaxs.push(Math.max(...G.locations.map(a => (a.y))))
            }
            return {
                xRange2: dilateRange([Math.min(...xmins), Math.max(...xmaxs)] as [number, number], 0.05),
                yRange2: dilateRange([Math.min(...ymins), Math.max(...ymaxs)] as [number, number], 0.05)
            }
        }
    }, [xRange, yRange, pointGroups])
    const layerProps: LayerProps = useMemo(() => ({
        pointGroups,
        selectedPointGroups,
        hoveredPointGroup,
        onHoverPointGroup: setSelectedPointGroups ? setHoveredPointGroup : undefined,
        onClickPointGroup: setSelectedPointGroups ? handleClickPointGroup : undefined,
        onClickPoint: onClickPoint,
        xRange: xRange2,
        yRange: yRange2,
        width,
        height,
        pointRadius,
        useDensityColor
    }), [pointGroups, hoveredPointGroup, setSelectedPointGroups, setHoveredPointGroup, handleClickPointGroup, selectedPointGroups, onClickPoint, xRange2, yRange2, width, height, pointRadius, useDensityColor])
    const mainLayer = useLayer(createClusterViewMainLayer, layerProps)
    const layers = useLayers([mainLayer])
    return (
        <CanvasWidget
            layers={layers}
            {...{width: layerProps.width, height: layerProps.height}}
        />
    )
}

const dilateRange = (r: [number, number], p: number): [number, number] => {
    const d = r[1] - r[0]
    return [r[0] - d * p / 2, r[1] + d * p / 2]
}

export default ClusterWidget