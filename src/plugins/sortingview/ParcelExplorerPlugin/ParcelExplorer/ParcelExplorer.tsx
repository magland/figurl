import React, { FunctionComponent, useMemo, useState } from 'react';
import { ParcelSorting } from '../ParcelExplorerPlugin';
import SegmentView from './SegmentView';
import SelectSegmentControl from './SelectSegmentControl';

type Props = {
    parcelSorting: ParcelSorting
    width: number
    height: number
}

const ParcelExplorer: FunctionComponent<Props> = ({parcelSorting}) => {
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0)
    const featureRanges = useMemo(() => (computeFeatureRanges(parcelSorting)), [parcelSorting])

    return (
        <div>
            <SelectSegmentControl
                parcelSorting={parcelSorting}
                currentSegmentIndex={currentSegmentIndex}
                setCurrentSegmentIndex={setCurrentSegmentIndex}
            />
            {
                <SegmentView
                    parcelSorting={parcelSorting}
                    featureRanges={featureRanges}
                    segmentIndex={currentSegmentIndex}
                />
            }
        </div>
    )
}

const computeFeatureRanges = (parcelSorting: ParcelSorting) => {
    const numFeatures = parcelSorting.feature_components.length
    const ranges: {range: [number, number]}[] = []
    for (let i = 0; i < numFeatures; i++) {
        ranges.push({range: [0, 1]})
    }
    let first = true
    for (let segment of parcelSorting.segments) {
        for (let parcel of segment.parcels) {
            if (parcel.features.length >= 10) {
                for (let j = 0; j < parcel.features.length; j++) {
                    for (let i = 0; i < numFeatures; i++) {
                        const val = parcel.features[j][i]
                        if (first) {
                            ranges[i].range[0] = val
                            ranges[i].range[1] = val
                        }
                        else {
                            ranges[i].range[0] = Math.min(ranges[i].range[0], val)
                            ranges[i].range[1] = Math.max(ranges[i].range[1], val)
                        }
                    }
                    first = false
                }
            }
        }
    }
    return ranges
}

export default ParcelExplorer