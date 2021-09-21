import { Button, TextField } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useState } from 'react';
import useRoute from '../MainWindow/useRoute';

type Props = {

}

const ViewGistControl: FunctionComponent<Props> = () => {
    const [gistUrl, setGistUrl] = useState<string>('')
    const handleGistUrlChange = useCallback((evt: any) => {
        const val: string = evt.target.value
        setGistUrl(val)
    }, [])
    const {setRoute} = useRoute()
    const gistPath = gistPathFromUrl(gistUrl)
    const handleView = useCallback(() => {
        setRoute({routePath: '/doc', gist: gistPath})
    }, [gistPath, setRoute])
    const viewOkay = (gistPath !== undefined)
    return (
        <div>
            <div>
                <TextField style={{width: '100%'}} label="Raw gist URL" value={gistUrl} onChange={handleGistUrlChange} />
            </div>
            <Button onClick={handleView} disabled={!viewOkay}>View document</Button>
        </div>
    )
}

const gistPathFromUrl = (url: string) => {
    if (!url.startsWith('https://gist.githubusercontent.com/')) return undefined
    const a = url.split('/')
    if (a.length !== 8) return undefined
    const user = a[3]
    const id = a[4]
    const file = a[7]
    return `${user}/${id}/${file}`
}

export default ViewGistControl