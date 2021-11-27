import axios from 'axios';
import { ChannelName } from 'commonInterface/kacheryTypes';
import randomAlphaString from 'commonInterface/util/randomAlphaString';
import { useChannel, useKacheryNode } from 'figurl/kachery-react';
import QueryString from 'querystring';
import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import FigureInterface from './FigureInterface';
import useGoogleSignInClient from 'commonComponents/googleSignIn/useGoogleSignInClient'
import urlFromUri from 'commonInterface/util/urlFromUri';
import deserializeReturnValue from 'figurl/kachery-react/deserializeReturnValue';

type Props = {
    width: number
    height: number
}

const useFigureData = (dataHash: string | undefined, channelName: ChannelName | undefined) => {
    const [figureData, setFigureData] = useState<any>()
    const node = useKacheryNode()
    useEffect(() => {
        ;(async () => {
            if (!dataHash) return
            if (!channelName) return
            const bucketBaseUrl = await node.kacheryHubInterface().getChannelBucketBaseUrl(channelName)
            const s = dataHash.toString()
            const dataUrl = `${bucketBaseUrl}/${channelName}/sha1/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`
            const x = await axios.get(dataUrl, {responseType: 'json'})
            let data = x.data
            data = deserializeReturnValue(data)
            setFigureData(data)
        })()

        // // for testing
        // setTimeout(() => {
        //     setFigureData({
        //         spec: {"config": {"view": {"continuousWidth": 400, "continuousHeight": 300}}, "data": {"name": "data-c2a3e89ba9d5d1687d5e8c28d630a033"}, "mark": "bar", "encoding": {"x": {"type": "nominal", "field": "a"}, "y": {"type": "quantitative", "field": "b"}}, "$schema": "https://vega.github.io/schema/vega-lite/v4.8.1.json", "datasets": {"data-c2a3e89ba9d5d1687d5e8c28d630a033": [{"a": "AX", "b": 28}, {"a": "BX", "b": 55}, {"a": "C", "b": 43}, {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53}, {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}]}}
        //     })
        // }, 3000)

    }, [dataHash, channelName, node])
    return figureData
}

export const useRoute2 = () => {
    const location = useLocation()
    // const history = useHistory()
    const query = useMemo(() => (QueryString.parse(location.search.slice(1))), [location.search]);
    let viewUrl = query.v ? query.v as string : undefined
    let viewUrlBase = viewUrl
    if ((viewUrl) && (viewUrl.startsWith('gs://'))) {
        viewUrlBase = urlFromUri(viewUrl)
        viewUrl = viewUrlBase + '/index.html'
    }
    const figureDataHash = query.d ? query.d as string : undefined
    const channelName = query.channel ? query.channel as any as ChannelName : undefined
    return {viewUrl, viewUrlBase, figureDataHash, channelName}
}

const Figure2: FunctionComponent<Props> = ({width, height}) => {
    const {viewUrl, figureDataHash, channelName} = useRoute2()
    const kacheryNode = useKacheryNode()
    const {backendId} = useChannel()
    const figureData = useFigureData(figureDataHash, channelName)
    const [figureId, setFigureId] = useState<string>()
    const iframeElement = useRef<HTMLIFrameElement | null>()
    const googleSignInClient = useGoogleSignInClient()
    useEffect(() => {
        if (!figureData) return
        if (!viewUrl) return
        if (!channelName) return
        if (!googleSignInClient) return
        const id = randomAlphaString(10)
        new FigureInterface({
            kacheryNode,
            channelName,
            backendId,
            figureId: id,
            viewUrl,
            figureData,
            iframeElement,
            googleSignInClient
        })
        setFigureId(id)
    }, [viewUrl, figureData, kacheryNode, channelName, backendId, googleSignInClient])
    if (!figureData) {
        return <div>Waiting for figure data</div>
    }
    if (!figureId) {
        return <div>Waiting for figure ID</div>
    }
    const parentOrigin = window.location.protocol + '//' + window.location.host
    return (
        <iframe
            ref={e => {iframeElement.current = e}}
            title="figure"
            src={`${viewUrl}?parentOrigin=${parentOrigin}&figureId=${figureId}`}
            width={width}
            height={height - 10} // we don't want the scrollbar to appear
        />
    )
}

export default Figure2