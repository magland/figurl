import { Checkbox } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useEffect } from 'react';
import { ParcelSortingSegment } from '../ParcelExplorerPlugin';

type Props = {
    segment: ParcelSortingSegment
    selectedParcelIndices: number[]
    setSelectedParcelIndices: (x: number[]) => void
}

const SelectParcelsControl: FunctionComponent<Props> = ({segment, selectedParcelIndices, setSelectedParcelIndices}) => {
    const handleClick = useCallback((ii: number) => {
        if (selectedParcelIndices.includes(ii))
            setSelectedParcelIndices(selectedParcelIndices.filter(a => (a !== ii)))
        else
            setSelectedParcelIndices([...selectedParcelIndices, ii])
    }, [selectedParcelIndices, setSelectedParcelIndices])
    useEffect(() => {
        setSelectedParcelIndices([])
    }, [segment, setSelectedParcelIndices])
    return (
        <div>
            <h3>Select parcels:</h3>
            {
                segment.parcels.map((parcel, ii) => (
                    <span key={ii}><Checkbox checked={selectedParcelIndices.includes(ii)} onClick={() => handleClick(ii)} /> {ii}</span>
                ))
            }
        </div>
    )
}

export default SelectParcelsControl