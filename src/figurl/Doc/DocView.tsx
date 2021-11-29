import Markdown from 'commonComponents/Markdown/Markdown';
import { ChannelName, isSha1Hash } from 'commonInterface/kacheryTypes';
import { useChannel } from 'figurl/kachery-react';
import QueryString from 'querystring';
import React, { FunctionComponent, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

type Props = {
    width: number
    height: number
    source: string
}

const parseFigurl = (url: string) => {
    const i1 = url.indexOf('?')
    if (i1 < 0) return {figureObject: undefined, channel: undefined}
    const a = url.slice(0, i1)
    if ((!a.startsWith('https://figurl.org/fig')) && (!a.startsWith('https://www.figurl.org/fig'))) {
        return {figureObject: undefined, channel: undefined}
    }
    const b = url.slice(i1 + 1)
    const query = QueryString.parse(b)
    const channel = query['channel'] as any as ChannelName
    const figureObject = query['figureObject']
    const height = query['height']
    return {figureObject, channel, height: height ? Number(height) : undefined}
}

const DocView: FunctionComponent<Props> = ({source, width, height}) => {
    const {channelName} = useChannel()
    const customRenderers: ReactMarkdown.Renderers = useMemo(() => ({
        link: (props: any) => {
            const href: string = props.href
            const {figureObject, channel: hrefChannel} = parseFigurl(href)
            // detect whether it is just a normal link
            if (props.children[0].props.children !== href) {
                return <a href={props.href} target={props.target}>{props.children}</a>
            }
            if ((figureObject) && (hrefChannel !== channelName)) {
                return <div>Channel mismatch: {hrefChannel} is not {channelName}</div>
            }
            else if ((figureObject) && (isSha1Hash(figureObject))) {
                return (
                    <div>Figure not implemented</div>
                    // <Figure
                    //     width={width}
                    //     height={height || 800}
                    //     figureObjectOrHash={figureObject}
                    // />
                )
            }
            else {
                return <a href={props.href} target={props.target}>{props.children}</a>
            }
        }
    }), [channelName])
    return (
        <div>
            <Markdown
                source={source}
                linkTarget={'_blank'}
                renderers={customRenderers}
            />
        </div>
    )
}

export default DocView