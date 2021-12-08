import { Button, TextField } from '@material-ui/core';
import { useChannel } from 'figurl/kachery-react';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

type Props = {

}

const EditBackendIdControl: FunctionComponent<Props> = () => {
    const {channelName, backendId, setBackendIdForChannel} = useChannel()
    
    const [editBackendId, setEditBackendId] = useState<string | null>(null)
    useEffect(() => {
        setEditBackendId(backendId)
    }, [backendId])

    const handleBackendIdChange = useCallback((evt: any) => {
        const val: string = evt.target.value
        setEditBackendId(val)
    }, [])

    const handleClickSet = useCallback(() => {
        setBackendIdForChannel(channelName.toString(), editBackendId || null)
    }, [channelName, editBackendId, setBackendIdForChannel])

    return (
        <span>
            <TextField style={{width: '100%'}} label="Backend ID" value={editBackendId || ''} onChange={handleBackendIdChange} />
            <Button disabled={editBackendId === backendId} onClick={handleClickSet}>Set</Button>
        </span>
    )
}

export default EditBackendIdControl