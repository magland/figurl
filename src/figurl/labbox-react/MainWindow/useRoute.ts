import { FigureObject } from 'figurl/types'
import { ChannelName, isSha1Hash, isString, JSONStringifyDeterministic, Sha1Hash } from 'commonInterface/kacheryTypes'
import QueryString from 'querystring'
import { useCallback, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import RoutePath, { isRoutePath } from './RoutePath'

const useRoute = () => {
    const location = useLocation()
    const history = useHistory()
    const query = useMemo(() => (QueryString.parse(location.search.slice(1))), [location.search]);
    const figureObjectOrHash = useMemo(() => {
        const x = (query.figureObject as string) || undefined
        if (!x) return undefined
        if (isSha1Hash(x)) {
            return x as Sha1Hash
        }
        else if (x.startsWith("{")) {
            try {
                return JSON.parse(x)
            }
            catch {
                console.warn(`Problem parsing figureObject: ${x}`)
                return undefined    
            }
        }
        else {
            console.warn(`Not a valid sha1 hash or object: ${x}`)
            return undefined
        }
    }, [query.figureObject])
    const channel = (query.channel as any as ChannelName) || undefined
    const p = location.pathname
    const figureLabel = p === '/fig' ? (query.label as any as string) || undefined : undefined
    // const documentId = p === '/compose' ? (query.document as any as string) || undefined : undefined
    const wiki = p === '/doc' ? (query.wiki as any as string) || undefined : undefined
    const routePath: RoutePath = isRoutePath(p) ? p : '/home'

    const setRoute = useCallback((o: {routePath?: RoutePath, figureObjectOrHash?: FigureObject | Sha1Hash, channel?: ChannelName, figureLabel?: string, wiki?: string}) => {
        const query2 = {...query}
        let pathname2 = location.pathname
        if (o.routePath) pathname2 = o.routePath
        if (o.figureObjectOrHash !== undefined) {
            const x = o.figureObjectOrHash
            if (isString(x)) {
                query2.figureObject = x.toString()
            }
            else {
                query2.figureObject = encodeURIComponent(JSONStringifyDeterministic(x))
            }
        }
        if (o.figureLabel) {
            query2.label = o.figureLabel
        }
        // if (o.documentId) {
        //     query2.document = o.documentId
        // }
        if (o.wiki) {
            query2.wiki = o.wiki
        }
        if (o.routePath !== '/fig') {
            delete query2['figureObject']
            delete query2['label']
            delete query2['state']
        }
        // if (o.routePath !== '/compose') {
        //     delete query2['document']
        // }
        if (o.routePath !== '/doc') {
            delete query2['wiki']
        }
        delete query2['workspaceRoute'] // historical
        if (o.channel !== undefined) query2.channel = o.channel.toString()
        const search2 = queryString(query2)
        history.push({...location, pathname: pathname2, search: search2})
    }, [location, history, query])
    
    return {routePath, figureObjectOrHash, channel, figureLabel, wiki, query, setRoute}
}

const queryString = (params: { [key: string]: string | string[] }) => {
    const keys = Object.keys(params)
    if (keys.length === 0) return ''
    return '?' + (
        keys.map((key) => {
            const v = params[key]
            if (typeof(v) === 'string') {
                return encodeURIComponent(key) + '=' + v
            }
            else {
                return v.map(a => (encodeURIComponent(key) + '=' + a)).join('&')
            }
        }).join('&')
    )
}

export default useRoute