import { IconButton } from '@material-ui/core';
import { Save } from '@material-ui/icons';
import React, { FunctionComponent } from 'react';

type Props = {
    onClick: () => void
    color: any
}

const SaveFigureControl: FunctionComponent<Props> = ({ onClick, color }) => {
    return (
        <IconButton style={{color}} title="Save figure" onClick={onClick}><Save /></IconButton>
    );
}

export default SaveFigureControl