import { isArrayOf, isNumber, _validateObject } from "commonInterface/kacheryTypes";
import { FigurlPlugin } from "figurl/types";
import React, { FunctionComponent } from 'react';
import ParcelExplorer from "./ParcelExplorer/ParcelExplorer";

export type Parcel = {
    timestamps: number[]
    features: number[][]
}

const isParcel = (x: any): x is Parcel => {
    return _validateObject(x, {
        timestamps: () => (true),
        features: () => (true),
    })
}

export type ParcelSortingSegment = {
    start_frame: number
    end_frame: number
    parcels: Parcel[]
}

const isParcelSortingSegment = (x: any): x is ParcelSortingSegment => {
    return _validateObject(x, {
        start_frame: isNumber,
        end_frame: isNumber,
        parcels: isArrayOf(isParcel)
    })
}

export type ParcelSorting = {
    feature_components: number[][][]
    segments: ParcelSortingSegment[]
}

const isParcelSorting = (x: any): x is ParcelSorting => {
    return _validateObject(x, {
        feature_components: () => (true),
        segments: isArrayOf(isParcelSortingSegment)
    })
}


type ParcelExplorerData = {
    parcelSorting: ParcelSorting
}
const isParcelExplorerData = (x: any): x is ParcelExplorerData => {
    return _validateObject(x, {
        parcelSorting: isParcelSorting
    })
}

type Props = {
    data: ParcelExplorerData
    width: number
    height: number
}


const ParcelExplorerComponent: FunctionComponent<Props> = ({data, width, height}) => {
    const {parcelSorting} = data

    return (
        <ParcelExplorer
            parcelSorting={parcelSorting}
            width={width}
            height={height}
        />
    )
}

const ParcelExplorerPlugin: FigurlPlugin = {
    type: 'sortingview.parcelexplorer.1',
    validateData: isParcelExplorerData,
    component: ParcelExplorerComponent
}

export default ParcelExplorerPlugin