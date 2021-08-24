import { IconButton } from '@material-ui/core';
import { Storage } from '@material-ui/icons';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import useChannel from '../../useChannel';

type Props = {
    onOpen: () => void
    color: any
}

const ChannelControl: FunctionComponent<Props> = ({ onOpen, color }) => {
    const {channelName, backendId} = useChannel()
    const { icon, title } = useMemo(() => {
        return {icon: <Storage />, title: channelName ? `Channel: ${channelName} | backend ID: ${backendId}` : 'Configure channel and backend ID'}
    }, [channelName, backendId])

    const handleClick = useCallback(() => {
        onOpen()
    }, [onOpen])

    return (
        <IconButton style={{color}} title={title} onClick={handleClick}>{icon}</IconButton>
    );
}

export default ChannelControl