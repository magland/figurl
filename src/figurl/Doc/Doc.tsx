import axios from 'axios';
import ComposeDocPreview from 'figurl/Compose/ComposeDocPreview';
import { useChannel } from 'figurl/kachery-react';
import { useWindowDimensions } from 'figurl/labbox-react';
import useRoute from 'figurl/labbox-react/MainWindow/useRoute';
import { isLoadGistResponse, LoadGistRequest } from 'miscTypes/LoadGistRequest';
import React, { FunctionComponent, useEffect, useState } from 'react';

type Props = {

}

const Doc: FunctionComponent<Props> = () => {
    const {gist} = useRoute()
    const {user, id, file} = parseGist(gist || '')
    const {channelName} = useChannel()
    const {width, height} = useWindowDimensions()
    const [source, setSource] = useState<string | undefined>(undefined)
    useEffect(() => {
        if (!user) return
        if (!id) return
        if (!file) return
        ;(async () => {
            const req: LoadGistRequest = {
                type: 'loadGist',
                user,
                id,
                file
            }
            const x = await axios.post('/api/loadGist', req)
            const resp = x.data
            if (!isLoadGistResponse(resp)) {
                throw Error('Unexpected loadGist response')
            }
            setSource(resp.content)
        })()
    })
    if (!user) return <div>Invalid gist</div>    
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

const parseGist = (x: string) => {
    const a = x.split('/')
    if (a.length !== 3) return {
        user: undefined,
        id: undefined,
        file: undefined
    }
    return {
        user: a[0],
        id: a[1],
        file: a[2]
    }
}

export default Doc