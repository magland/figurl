import React from 'react'
import { FunctionComponent } from "react"
import Hyperlink from 'figurl/labbox-react/components/Hyperlink/Hyperlink'
import { ChannelName } from 'commonInterface/kacheryTypes'
import { loadChannelItems } from './channelItemsReducer'

type Props = {
    onSelectChannel: (channel: ChannelName) => void
}

const RecentlyUsedBackends: FunctionComponent<Props> = ({onSelectChannel}) => {
    const channelItems = loadChannelItems()
    return (
        channelItems.length > 0 ? (
            <p>Recently used channels: {channelItems.map(x => (<span key={x.channel.toString()}><Hyperlink onClick={() => {onSelectChannel(x.channel)}}>{x.channel}</Hyperlink>&nbsp;</span>))}</p>
        ) : <span />
    )
}

export default RecentlyUsedBackends