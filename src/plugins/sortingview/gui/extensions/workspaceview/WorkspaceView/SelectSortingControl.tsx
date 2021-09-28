import { Sorting } from 'plugins/sortingview/gui/pluginInterface';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import DropdownSelect from './DropdownSelect';

type Props = {
    label: string
    sortings: Sorting[]
    selectedSorting: Sorting | undefined
    onSelect: (sorting: Sorting | undefined) => void
}

const SelectSortingControl: FunctionComponent<Props> = ({label, sortings, selectedSorting, onSelect}) => {
    const handleSetValue = useCallback((v) => {
        if (v) {
            const s = sortings.filter(s => (s.sortingId === v))[0]
            onSelect(s)
        }
        else onSelect(undefined)
    }, [onSelect, sortings])
    const options = useMemo(() => (
        sortings.map(s => ({
            label: s.sortingLabel,
            value: s.sortingId
        }))
    ), [sortings])
    return (
        <DropdownSelect
            label={label}
            value={selectedSorting?.sortingId}
            onSetValue={handleSetValue}
            options={options}
        />
    )
}

export default SelectSortingControl