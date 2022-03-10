import { IconButton } from '@material-ui/core';
import { Save } from '@material-ui/icons';
import { useSignedIn } from 'commonComponents/googleSignIn/GoogleSignIn';
import React, { FunctionComponent, useCallback } from 'react';

type Props = {
    onClick: () => void
    color: any
}

const SaveFigureControl: FunctionComponent<Props> = ({ onClick, color }) => {
    const {signedIn} = useSignedIn()
    const tooltip = signedIn ? 'Save figure' : 'Sign in to save figure'
    const handleClick = useCallback(() => {
        if (!signedIn) {
            alert('You must be signed in to save a figure.')
            return
        }
        onClick()
    }, [signedIn, onClick])
    return (
        <IconButton style={{color}} title={tooltip} onClick={handleClick}><Save /></IconButton>
    );
}

export default SaveFigureControl