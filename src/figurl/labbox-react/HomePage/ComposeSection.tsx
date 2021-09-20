import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import React, { FunctionComponent, useCallback } from 'react';
import useRoute from '../MainWindow/useRoute';

type Props = {

}

const ComposeSection: FunctionComponent<Props> = () => {
    const {setRoute} = useRoute()
    const handleCompose = useCallback(() => {
        setRoute({routePath: '/compose'})
    }, [setRoute])
    return (
        <div>
            <h3>Figurl compose</h3>
            <Hyperlink onClick={handleCompose}>Compose a document</Hyperlink>
        </div>
    )
}

export default ComposeSection