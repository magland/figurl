import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import useVisible from 'commonComponents/useVisible';
import React, { FunctionComponent, useCallback } from 'react';
import useRoute from '../MainWindow/useRoute';
import ViewGistControl from './ViewGistControl';

type Props = {

}

const DocumentSection: FunctionComponent<Props> = () => {
    const {setRoute} = useRoute()
    const handleCompose = useCallback(() => {
        setRoute({routePath: '/compose'})
    }, [setRoute])
    const gistControlVisibility = useVisible()
    return (
        <div>
            <h3>Documents</h3>
            <div>
                <Hyperlink onClick={handleCompose}>Compose a document on this device</Hyperlink>
            </div>
            <div>
                <Hyperlink onClick={gistControlVisibility.show}>View a gist document</Hyperlink>
            </div>
            {
                gistControlVisibility.visible && (
                    <ViewGistControl />
                )
            }
        </div>
    )
}

export default DocumentSection