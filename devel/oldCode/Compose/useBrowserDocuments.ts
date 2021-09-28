import { ChannelName } from "commonInterface/kacheryTypes"
import { useChannel } from "figurl/kachery-react"
import { useCallback, useEffect, useState } from "react"

export type BrowserDocument = {
    documentId: string
    label: string
    channel: ChannelName
    source: string
    dateCreated: number
    dateModified: number
    dateAccessed: number
}

const useBrowserDocuments = () => {
    const {channelName} = useChannel()
    const [documents, setDocuments] = useState<BrowserDocument[]>([])
    useEffect(() => {
        if (!channelName) return
        const a = localStorage.getItem(`documents-${channelName}`)
        const d: BrowserDocument[] = a ? JSON.parse(a) as any as BrowserDocument[] : []
        setDocuments(d)
    }, [channelName])

    useEffect(() => {
        if (!channelName) return
        localStorage.setItem(`documents-${channelName}`, JSON.stringify(documents))
    }, [documents, channelName])

    const setDocument = useCallback((doc: BrowserDocument) => {
        const newDocuments = [...documents.filter(doc2 => (doc2.documentId !== doc.documentId)), doc]
        setDocuments(newDocuments)
    }, [documents])

    const deleteDocument = useCallback((id: string) => {
        const newDocuments = documents.filter(doc => (doc.documentId !== id))
        setDocuments(newDocuments)
    }, [documents])

    return {documents, setDocument, deleteDocument}
}

export default useBrowserDocuments