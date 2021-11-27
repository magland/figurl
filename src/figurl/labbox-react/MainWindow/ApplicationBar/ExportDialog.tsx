import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import { useRoute2 } from 'figurl/Figure2/Figure2';
import React, { FunctionComponent, useCallback } from 'react';
import axios from 'axios'
import {saveAs} from 'file-saver'

type Props = {
    onClose: () => void
}

const ExportDialog: FunctionComponent<Props> = () => {
    const {viewUrlBase} = useRoute2()
    const handleExportBundle = useCallback(() => {
        ;(async () => {
            const resp = await axios.get(viewUrlBase + '/bundle.zip', {responseType: 'blob'})
            saveAs(resp.data, 'bundle.zip')
        })()
    }, [viewUrlBase])
    return (
        <div>
            <Hyperlink onClick={handleExportBundle}>
                Export figure as stand-alone HTML bundle
            </Hyperlink>
        </div>
    )
}

export default ExportDialog