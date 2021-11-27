import { IconButton } from '@material-ui/core';
import { CloudDownload } from '@material-ui/icons';
import React, { FunctionComponent } from 'react';

type Props = {
    onClick: () => void
    color: any
}

const ExportControl: FunctionComponent<Props> = ({ onClick, color }) => {
    return (
        <IconButton style={{color}} title="Export figure" onClick={onClick}><CloudDownload /></IconButton>
    );
}

export default ExportControl