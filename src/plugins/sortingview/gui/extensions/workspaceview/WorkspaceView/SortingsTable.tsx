import { Button, CircularProgress } from '@material-ui/core';
import NiceTable from 'figurl/labbox-react/components/NiceTable/NiceTable';
import { useSortingInfos } from 'plugins/sortingview/gui/pluginInterface/useSortingInfo';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { Recording, Sorting, WorkspaceRouteDispatch } from "../../../pluginInterface";
import SelectSortingControl from './SelectSortingControl';

interface Props {
    recording: Recording
    sortings: Sorting[]
    workspaceRouteDispatch: WorkspaceRouteDispatch
    onDeleteSortings?: ((sortingIds: string[]) => void)
}

const SortingsTable: FunctionComponent<Props> = ({ recording, sortings, onDeleteSortings, workspaceRouteDispatch }) => {

    // const [selectedSortingIds, setSelectedSortingIds] = useState<string[]>([])

    const handleViewSorting = useCallback((sorting: Sorting) => {
        workspaceRouteDispatch({
            type: 'gotoSortingPage',
            recordingId: sorting.recordingId,
            sortingId: sorting.sortingId
        })
    }, [workspaceRouteDispatch])

    const sortingInfos = useSortingInfos(sortings)

    const sortings2: Sorting[] = useMemo(() => (sortByKey<Sorting>(sortings, 'sortingLabel')), [sortings])
    const rows = useMemo(() => (sortings2.map(s => {
        const sortingInfo = sortingInfos[s.sortingId]
        return {
            key: s.sortingId,
            columnValues: {
                sorting: s,
                sortingLabel: {
                    text: s.sortingLabel,
                    element: <ViewSortingLink sorting={s} onClick={handleViewSorting} />
                },
                numUnits: sortingInfo ? sortingInfo.unit_ids.length : {element: <CircularProgress />}
            }
        }
    })), [sortings2, handleViewSorting, sortingInfos])

    const handleDeleteRow = useCallback((key: string) => {
        onDeleteSortings && onDeleteSortings([key])
    }, [onDeleteSortings])

    const columns = [
        {
            key: 'sortingLabel',
            label: 'Sorting'
        },
        {
            key: 'numUnits',
            label: 'Num. units'
        }
    ]

    const [sortingA, setSortingA] = useState<Sorting | undefined>(undefined)
    const [sortingB, setSortingB] = useState<Sorting | undefined>(undefined)

    const compareEnabled = (sortingA !== undefined) && (sortingB !== undefined)
    const handleCompareSortings = useCallback(() => {
        if ((!sortingA) || (!sortingB)) throw Error('Unexpected')
        const sortingId1 = sortingA.sortingId
        const sortingId2 = sortingB.sortingId
        workspaceRouteDispatch({type: 'gotoSortingComparisonPage', sortingId1, sortingId2, recordingId: recording.recordingId})
    }, [workspaceRouteDispatch, sortingA, sortingB, recording])

    return (
        <div>
            <NiceTable
                rows={rows}
                columns={columns}
                deleteRowLabel={"Remove this sorting"}
                onDeleteRow={onDeleteSortings ? handleDeleteRow : undefined}
                // selectionMode="multiple"
                // selectedRowKeys={selectedSortingIds}
                // onSelectedRowKeysChanged={setSelectedSortingIds}
            />
            {
                sortings2.length > 1 && (
                    <div>
                        Compare sortings:&nbsp;&nbsp;
                        <SelectSortingControl label="Select sorting A" sortings={sortings2} selectedSorting={sortingA} onSelect={setSortingA} />
                        &nbsp;&nbsp;&nbsp;
                        <SelectSortingControl label="Select sorting B" sortings={sortings2} selectedSorting={sortingB} onSelect={setSortingB} />
                        &nbsp;&nbsp;&nbsp;
                        <Button disabled={!compareEnabled} onClick={handleCompareSortings}>Compare selected sortings</Button>
                    </div>
                )
            }
        </div>
    );
}

const ViewSortingLink: FunctionComponent<{sorting: Sorting, onClick: (s: Sorting) => void}> = ({sorting, onClick}) => {
    const handleClick = useCallback(() => {
        onClick(sorting)
    }, [sorting, onClick])
    return (
        <Anchor title="View recording" onClick={handleClick}>{sorting.sortingLabel}</Anchor>
    )
}

const Anchor: FunctionComponent<{title: string, onClick: () => void}> = ({title, children, onClick}) => {
    return (
        <button type="button" className="link-button" onClick={onClick}>{children}</button>
    )
}

const sortByKey = <T extends {[key: string]: any}>(array: T[], key: string): T[] => {
    return array.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}



export default SortingsTable