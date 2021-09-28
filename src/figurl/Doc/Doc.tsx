import axios from 'axios';
import ComposeDocPreview from './DocView';
import { useChannel } from 'figurl/kachery-react';
import { useWindowDimensions } from 'figurl/labbox-react';
import useRoute from 'figurl/labbox-react/MainWindow/useRoute';
import { isLoadWikiPageResponse, LoadWikiPageRequest } from 'miscTypes/LoadWikiPageRequest';
import React, { FunctionComponent, useEffect, useState } from 'react';

type Props = {

}

const Doc: FunctionComponent<Props> = () => {
    const {wiki} = useRoute()
    const {user, repo, page} = parseWiki(wiki || '')
    const {channelName} = useChannel()
    const {width, height} = useWindowDimensions()
    const [source, setSource] = useState<string | undefined>(undefined)
    useEffect(() => {
        if (!user) return
        if (!repo) return
        if (!page) return
        ;(async () => {
            const req: LoadWikiPageRequest = {
                type: 'loadWikiPage',
                user,
                repo,
                page
            }
            const x = await axios.post('/api/loadWikiPage', req)
            const resp = x.data
            if (!isLoadWikiPageResponse(resp)) {
                throw Error('Unexpected loadWikiPage response')
            }
            setSource(resp.content)
        })()
    })
    if (!user) return <div>Invalid wiki page</div>    
    if (!channelName) return <div>No channel</div>

    if (source === undefined) {
        return <div>Loading...</div>
    }

    return (
        <div style={{margin: 15}}>
            <ComposeDocPreview
                source={source}
                width={width - 30}
                height={height - 90}
            />
        </div>
    )
}

const parseWiki = (x: string) => {
    let a = x.split('/')
    if (a.length !== 3) return {
        user: undefined,
        repo: undefined,
        page: undefined
    }
    return {
        user: a[0],
        repo: a[1],
        page: a[2]
    }
}

export default Doc