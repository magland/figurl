import Markdown from 'commonComponents/Markdown/Markdown';
import { ChannelName, isSha1Hash } from 'commonInterface/kacheryTypes';
import { useChannel } from 'figurl/kachery-react';
import Figure from 'figurl/labbox-react/MainWindow/Figure';
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
    return {figureObject, channel}
}

const ComposeDocPreview: FunctionComponent<Props> = ({source, width, height}) => {
    const {channelName} = useChannel()
    const customRenderers: ReactMarkdown.Renderers = useMemo(() => ({
        link: (props: any) => {
            const href: string = props.href
            const {figureObject, channel: hrefChannel} = parseFigurl(href)
            if ((figureObject) && (hrefChannel !== channelName)) {
                return <div>Channel mismatch: {hrefChannel} is not {channelName}</div>
            }
            else if ((figureObject) && (isSha1Hash(figureObject))) {
                return (
                    <Figure
                        width={width}
                        height={500}
                        figureObjectOrHash={figureObject}
                    />
                )
            }
            else {
                return <a href={props.href} target={props.target}>{props.children}</a>
            }
        }
    }), [width, channelName])
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

export default ComposeDocPreview