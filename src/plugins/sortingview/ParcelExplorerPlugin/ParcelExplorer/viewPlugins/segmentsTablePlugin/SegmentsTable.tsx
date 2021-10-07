import NiceTable from 'commonComponents/NiceTable/NiceTable';
import { ParcelSorting } from 'plugins/sortingview/ParcelExplorerPlugin/ParcelExplorerPlugin';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { ParcelSortingSelection, ParcelSortingSelectionDispatch } from '../../ViewPlugin';

type Props = {
    parcelSorting: ParcelSorting
    parcelSortingSelection: ParcelSortingSelection,
    parcelSortingSelectionDispatch: ParcelSortingSelectionDispatch,
}

const SegmentsTable: FunctionComponent<Props> = ({parcelSorting, parcelSortingSelection, parcelSortingSelectionDispatch}) => {
    const columns = useMemo(() => {
        const columns = []
        columns.push({
            key: 'segmentIndex',
            label: 'Segment'
        })
        return columns
    }, [])
    const rows = useMemo(() => (
        parcelSorting.segments.map((s, ii) => ({
            key: `${ii}`,
            columnValues: {
                segmentIndex: `${ii}`
            }
        })
    )), [parcelSorting])
    const selectedRowKeys = useMemo(() => (
        [`${parcelSortingSelection.selectedSegmentIndex}`]
    ), [parcelSortingSelection])
    const handleSelectedRowKeysChanged = useCallback((keys: string[]) => {
        const k = keys[0]
        if (k === undefined) return
        parcelSortingSelectionDispatch({
            type: 'setSelectedSegment',
            selectedSegmentIndex: Number(k)
        })
    }, [parcelSortingSelectionDispatch])
    return (
        <NiceTable
            columns={columns}
            rows={rows}
            selectionMode="single"
            selectedRowKeys={selectedRowKeys}
            onSelectedRowKeysChanged={handleSelectedRowKeysChanged}
        />
    )
}

export default SegmentsTable