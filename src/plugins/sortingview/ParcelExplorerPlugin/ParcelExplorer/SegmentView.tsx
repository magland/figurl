import React, { FunctionComponent, useMemo, useState } from 'react';
import { ParcelSorting } from '../ParcelExplorerPlugin';
import ClusterWidget from './ClusterWidget';
import SelectParcelsControl from './SelectParcelsControl';

type Props = {
    parcelSorting: ParcelSorting
    featureRanges: {range: [number, number]}[]
    segmentIndex: number
}

const SegmentView: FunctionComponent<Props> = ({parcelSorting, segmentIndex, featureRanges}) => {
    const segment = useMemo(() => (parcelSorting.segments[segmentIndex]), [parcelSorting, segmentIndex])
    const [selectedParcelIndices, setSelectedParcelIndices] = useState<number[]>([])
    const {xFeatures, yFeatures, highlighted, xRange, yRange} = useMemo(() => {
        const xFeatures: number[] = []
        const yFeatures: number[] = []
        const highlighted: boolean[] = []
        for (let j = 0; j < segment.parcels.length; j++) {
            const parcel = segment.parcels[j]
            const h = selectedParcelIndices.includes(j)
            for (let i = 0; i < parcel.features.length; i++) {
                xFeatures.push(parcel.features[i][0])
                yFeatures.push(parcel.features[i][1])
                highlighted.push(h)
            }
        }
        const xRange = featureRanges[0].range
        const yRange = featureRanges[1].range
        return {xFeatures, yFeatures, highlighted, xRange, yRange}
    }, [segment, featureRanges, selectedParcelIndices])
    return (
        <div>
            <SelectParcelsControl
                segment={segment}
                selectedParcelIndices={selectedParcelIndices}
                setSelectedParcelIndices={setSelectedParcelIndices}
            />
            <ClusterWidget
                xFeatures={xFeatures}
                yFeatures={yFeatures}
                highlighted={highlighted}
                xRange={xRange}
                yRange={yRange}
                xLabel={"X"}
                yLabel={"Y"}
            />
        </div>
    )
}

export default SegmentView