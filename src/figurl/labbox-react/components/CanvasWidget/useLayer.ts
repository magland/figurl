import { useEffect, useState } from 'react'
import { BaseLayerProps, CanvasWidgetLayer } from './CanvasWidgetLayer'

export const useLayer = <LayerProps extends BaseLayerProps, LayerState extends Object>(createLayer: () => CanvasWidgetLayer<LayerProps, LayerState>, layerProps?: LayerProps): CanvasWidgetLayer<LayerProps, LayerState> | null => {
    const [layer, setLayer] = useState<CanvasWidgetLayer<LayerProps, LayerState> | null>(null)
    useEffect(() => {
        if (layer === null) {
            setLayer(createLayer())
        }
    }, [layer, setLayer, createLayer])
    if ((layer) && (layerProps)) {
        layer.setProps(layerProps)
    }
    return layer
}

export const useLayers = (layers: (CanvasWidgetLayer<any, any> | null)[]) => {
    const [prevLayers, setPrevLayers] = useState<(CanvasWidgetLayer<any, any> | null)[]>([])
    if (listsMatch(prevLayers, layers)) {
        return prevLayers
    }
    else {
        setPrevLayers(layers)
        return layers
    }
}

const listsMatch = (list1: any[], list2: any[]) => {
    if (list1.length !== list2.length) return false
    for (let i = 0; i < list1.length; i++) {
        if (list1[i] !== list2[i]) return false
    }
    return true
}
