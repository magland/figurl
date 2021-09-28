import { makeStyles, MenuItem, Select } from '@material-ui/core';
import React, { useMemo } from 'react';

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

const DropdownSelect: React.FunctionComponent<{
    label: string,
    value: any,
    onSetValue: (v: any) => void,
    options: {
        value: any,
        label: string,
    }[]
}> = ({ label, value, onSetValue, options }) => {
    const classes = useStyles();
    const options2 = useMemo(() => (
        [{value: '', label}, ...options]
    ), [options, label])
    return (
        <Select
            value={value || ''}
            onChange={(evt) => onSetValue(evt.target.value)}
            displayEmpty
            className={classes.selectEmpty}
            inputProps={{ 'aria-label': label }}
        >
            {
                options2.map(opt => (
                    <MenuItem value={opt.value} key={opt.label}>{opt.label}</MenuItem>
                ))
            }
        </Select>
    );
}

export default DropdownSelect