import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import useVisible from 'commonComponents/useVisible';
import React, { FunctionComponent, useCallback } from 'react';
import useRoute from '../MainWindow/useRoute';
import ViewWikiPageControl from './ViewWikiPageControl';

type Props = {

}

const DocumentSection: FunctionComponent<Props> = () => {
    const {setRoute} = useRoute()
    const handleCompose = useCallback(() => {
        setRoute({routePath: '/compose'})
    }, [setRoute])
    const wikiPageControlVisibility = useVisible()
    return (
        <div>
            <h3>Documents</h3>
            <div>
                <Hyperlink onClick={handleCompose}>Compose a document on this device</Hyperlink>
            </div>
            <div>
                <Hyperlink onClick={wikiPageControlVisibility.show}>View a GitHub wiki page document</Hyperlink>
            </div>
            {
                wikiPageControlVisibility.visible && (
                    <ViewWikiPageControl />
                )
            }
        </div>
    )
}

export default DocumentSection