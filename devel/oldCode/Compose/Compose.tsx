import { useChannel } from 'figurl/kachery-react';
import { useWindowDimensions } from 'figurl/labbox-react';
import useRoute from 'figurl/labbox-react/MainWindow/useRoute';
import React, { FunctionComponent } from 'react';
import ComposeDoc from './ComposeDoc';
import ComposeHome from './ComposeHome';

type Props = {

}

const Compose: FunctionComponent<Props> = () => {
    const {documentId} = useRoute()
    const {channelName} = useChannel()
    const {width, height} = useWindowDimensions()
    if ((documentId) && (channelName)) {
        return <ComposeDoc
            documentId={documentId}
            width={width}
            height={height - 60}
        />
    }
    else {
        return <ComposeHome />
    }
}

export default Compose