import { Button, TextField } from '@material-ui/core';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import NiceTable from 'commonComponents/NiceTable/NiceTable';
import randomAlphaString from 'commonInterface/util/randomAlphaString';
import { useVisible } from 'figurl/labbox-react';
import useRoute from 'figurl/labbox-react/MainWindow/useRoute';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import useBrowserDocuments, { BrowserDocument } from './useBrowserDocuments';
import { useChannel } from 'figurl/kachery-react';
import SelectChannelDialog from 'figurl/kachery-react/components/SelectChannel/SelectChannelDialog'

type Props = {

}

const columns = [
    {
        key: 'documentId',
        label: 'Document'
    },
    {
        key: 'label',
        label: 'Label'
    }
]

const ComposeHome: FunctionComponent<Props> = () => {
    const {channelName} = useChannel()
    const {documents, setDocument, deleteDocument} = useBrowserDocuments()
    const addVisibility = useVisible()
    const selectChannelVisibility = useVisible()
    const {setRoute} = useRoute()
    const handleDocumentClicked = useCallback((documentId: string) => {
        setRoute({routePath: '/compose', documentId})
    }, [setRoute])
    const rows = documents.map(doc => ({
        key: doc.documentId,
        columnValues: {
            documentId: {
                text: doc.documentId,
                element: <Hyperlink onClick={() => handleDocumentClicked(doc.documentId)}>{doc.documentId}</Hyperlink>
            },
            label: doc.label
        }
    }))
    const [newDocumentLabel, setNewDocumentLabel] = useState<string>('')
    const handleNewDocumentLabelChange = useCallback((evt: any) => {
        const val: string = evt.target.value
        setNewDocumentLabel(val)
    }, [])
    const addOkay = useMemo(() => {
        return (newDocumentLabel.length >= 3)
    }, [newDocumentLabel])
    const handleAdd = useCallback(() => {
        const doc: BrowserDocument = {
            documentId: randomAlphaString(10),
            channel: channelName,
            label: newDocumentLabel,
            source: '',
            dateCreated: Date.now(),
            dateAccessed: Date.now(),
            dateModified: Date.now()
        }
        setDocument(doc)
    }, [setDocument, newDocumentLabel, channelName])
    return (
        <div style={{padding: 20}}>
            <h2>Figurl compose</h2>
            {
                channelName ? (
                    <p>Kachery channel: <Hyperlink onClick={selectChannelVisibility.show}>{channelName}</Hyperlink></p>
                ) : (
                    <Hyperlink onClick={selectChannelVisibility.show}>Select a kachery channel</Hyperlink>
                )
            }
            {
                channelName && (addVisibility.visible) ? (
                    <div>
                        <TextField label="New document label" value={newDocumentLabel} onChange={handleNewDocumentLabelChange} />
                        <Button onClick={handleAdd} disabled={!addOkay}>Add</Button>
                    </div>
                ) : (
                    channelName && <Button onClick={addVisibility.show}>Add document</Button>
                )
            }
            {
                channelName && (
                    <div style={{maxWidth: 600}}>
                        <NiceTable
                            columns={columns}
                            rows={rows}
                            onDeleteRow={deleteDocument}
                            deleteRowLabel="Delete document"
                        />
                    </div>
                )
            }
            <SelectChannelDialog
                visible={selectChannelVisibility.visible}
                onClose={selectChannelVisibility.hide}
                hardCodedChannels={[]}
            />
        </div>
    )
}

export default ComposeHome