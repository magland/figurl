import { Button } from '@material-ui/core';
import Splitter from 'figurl/labbox-react/components/Splitter/Splitter';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import ComposeDocPreview from './ComposeDocPreview';
import ComposeDocSourceView from './ComposeDocSourceView';
import useBrowserDocuments, { BrowserDocument } from './useBrowserDocuments';

type Props = {
    documentId: string
    width: number
    height: number
}

const ComposeDoc: FunctionComponent<Props> = ({documentId, width, height}) => {
    const {documents, setDocument} = useBrowserDocuments()
    const [internalDocument, setInternalDocument] = useState<BrowserDocument | undefined>(undefined)
    const document = useMemo(() => {
        return documents.filter(doc => (doc.documentId === documentId))[0]
    }, [documents, documentId])
    useEffect(() => {
        setInternalDocument(document)
    }, [document])
    const handleSourceChange = useCallback((source: string) => {
        if (!internalDocument) return
        setInternalDocument({
            ...internalDocument,
            source
        })
    }, [internalDocument])
    const canSave = useMemo(() => ((internalDocument) && (internalDocument?.source !== document.source)), [internalDocument, document])
    const handleSave = useCallback(() => {
        if (!internalDocument) return
        setDocument(internalDocument)
    }, [internalDocument, setDocument])
    return (
        <div>
            <div style={{paddingLeft: 5}}>
                <Button style={{marginTop: 3}} disabled={!canSave} onClick={handleSave}>Save to this device</Button>
                {document && <span>&nbsp;{document.label} ({document.documentId})</span>}
            </div>
            <Splitter
                width={width}
                height={height - 40}
                initialPosition={Math.min(600, width / 2)}
            >
                <ComposeDocSourceView
                    source={internalDocument?.source || ''}
                    onSourceChange={handleSourceChange}
                />
                <ComposeDocPreview
                    width={0}
                    height={0}
                    source={internalDocument?.source || ''}
                />
            </Splitter>
        </div>
    )
}

export default ComposeDoc