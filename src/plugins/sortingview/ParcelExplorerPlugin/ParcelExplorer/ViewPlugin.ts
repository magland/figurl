import { ParcelSorting } from "../ParcelExplorerPlugin"

export type ParcelSortingSelection = {
    selectedSegmentIndex: number
}

export const initialParcelSortingSelection = {
    selectedSegmentIndex: 0
}

export type ParcelSortingSelectionAction = {
    type: 'setSelectedSegment',
    selectedSegmentIndex: number
}

export type ParcelSortingSelectionDispatch = (a: ParcelSortingSelectionAction) => void

export const parcelSortingSelectionReducer = (state: ParcelSortingSelection, action: ParcelSortingSelectionAction): ParcelSortingSelection => {
    if (action.type === 'setSelectedSegment') {
        return {
            ...state,
            selectedSegmentIndex: action.selectedSegmentIndex
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