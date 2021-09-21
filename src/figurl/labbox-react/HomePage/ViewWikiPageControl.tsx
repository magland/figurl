import { Button, TextField } from '@material-ui/core';
import { useChannel } from 'figurl/kachery-react';
import React, { FunctionComponent, useCallback, useState } from 'react';
import useRoute from '../MainWindow/useRoute';

type Props = {

}

const ViewWikiPageControl: FunctionComponent<Props> = () => {
    const [wikiPageUrl, setWikiPageUrl] = useState<string>('')
    const handleWikiPageUrlChange = useCallback((evt: any) => {
        const val: string = evt.target.value
        setWikiPageUrl(val)
    }, [])
    const {setRoute} = useRoute()
    const wikiPath = wikiPathFromUrl(wikiPageUrl)
    const handleView = useCallback(() => {
        setRoute({routePath: '/doc', wiki: wikiPath})
    }, [wikiPath, setRoute])
    const viewOkay = (wikiPath !== undefined)
    const {channelName} = useChannel()
    if (!channelName) {
        return <div>You must first select a channel (see above)</div>
    }
    return (
        <div>
            <div>
                <TextField style={{width: '100%'}} label="GitHub wiki page URL" value={wikiPageUrl} onChange={handleWikiPageUrlChange} />
            </div>
            <Button onClick={handleView} disabled={!viewOkay}>View document</Button>
        </div>
    )
}

const wikiPathFromUrl = (url: string) => {
    // https://github.com/magland/sortingview/wiki/example-workspace
    if (!url.startsWith('https://github.com/')) return undefined
    const a = url.split('/')
    if (a.length !== 7) return undefined
    const user = a[3]
    const repo = a[4]
    const page = a[6]
    return `${user}/${repo}/${page}`
}

export default ViewWikiPageControl