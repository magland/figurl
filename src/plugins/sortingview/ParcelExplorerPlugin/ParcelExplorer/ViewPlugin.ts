import { ParcelSorting } from "../ParcelExplorerPlugin"

export type ParcelRef = {
    segmentIndex: number
    parcelIndex: number
}

export const parcelRefToString = (r: ParcelRef): string => {
    return `${r.segmentIndex}:${r.parcelIndex}`
}

export const parcelRefFromString = (x: string): ParcelRef => {
    const v = x.split(':')
    return {segmentIndex: Number(v[0]), parcelIndex: Number(v[1])}
}

export type SpikeEventRef = {
    segmentIndex: number
    parcelIndex: number
    spikeEventIndex: number
}

export const spikeEventRefToString = (r: SpikeEventRef): string => {
    return `${r.segmentIndex}:${r.parcelIndex}:${r.spikeEventIndex}`
}

export const spikeEventRefFromString = (x: string): SpikeEventRef => {
    const v = x.split(':')
    return {segmentIndex: Number(v[0]), parcelIndex: Number(v[1]), spikeEventIndex: Number(v[2])}
}

export type ParcelSortingSelection = {
    selectedSegmentIndex: number
    selectedParcelRefs: ParcelRef[]
}

export const initialParcelSortingSelection: ParcelSortingSelection = {
    selectedSegmentIndex: 0,
    selectedParcelRefs: []
}

export type ParcelSortingSelectionAction = {
    type: 'setSelectedSegment',
    selectedSegmentIndex: number
} | {
    type: 'setSelectedParcels',
    selectedParcelRefs: ParcelRef[]
}

export type ParcelSortingSelectionDispatch = (a: ParcelSortingSelectionAction) => void

export const parcelSortingSelectionReducer = (state: ParcelSortingSelection, action: ParcelSortingSelectionAction): ParcelSortingSelection => {
    if (action.type === 'setSelectedSegment') {
        return {
            ...state,
            selectedSegmentIndex: action.selectedSegmentIndex
        }
    }
    else if (action.type === 'setSelectedParcels') {
        return {
            ...state,
            selectedParcelRefs: action.selectedParcelRefs
        }
    }
    else {
        throw Error('Unexpected')
    }
}

export type ViewProps = {
    parcelSorting: ParcelSorting
    parcelSortingSelection: ParcelSortingSelection,
    parcelSortingSelectionDispatch: ParcelSortingSelectionDispatch,
    featureRanges: {range: [number, number]}[]
    maxAmplitude: number
    width: number
    height: number
}


export interface ViewPlugin {
    name: string
    label: string
    component: React.ComponentType<ViewProps>
    singleton: boolean
    icon?: any
}

export class View {
    activate: boolean = false // signal to set this tab as active
    area: 'north' | 'south' | '' = ''
    constructor(public plugin: ViewPlugin, public extraProps: {[key: string]: any}, public label: string, public viewId: string) {

    }
}