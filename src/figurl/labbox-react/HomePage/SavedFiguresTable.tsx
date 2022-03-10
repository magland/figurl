import { useSignedIn } from 'commonComponents/googleSignIn/GoogleSignIn';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import NiceTable from 'commonComponents/NiceTable/NiceTable';
import { UserId } from 'commonInterface/kacheryTypes';
import { DeleteFigureRequest, Figure, GetFiguresRequest, isDeleteFigureResponse, isGetFiguresResponse } from 'miscTypes/FigureRequest';
import postFigureRequest from 'miscTypes/postFigureRequest';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

type Props = {

}

const useFigures = (userId: UserId | null | undefined, googleIdToken: string | undefined) => {
    const [figures, setFigures] = useState<Figure[] | undefined>(undefined)
    const [updateCode, setUpdateCode] = useState<number>(0)
    const incrementUpdateCode = useCallback(() => {setUpdateCode(c => (c+1))}, [])
    useEffect(() => {
        setFigures(undefined)
        if (!userId) return
        let canceled = false
        ;(async () => {
            const req: GetFiguresRequest = {
                type: 'getFigures',
                ownerId: userId.toString()
            }
            const resp = await postFigureRequest(req, {reCaptcha: false})
            if (!isGetFiguresResponse(resp)) {
                throw Error('Unexpected response to getFigures')
            }
            if (canceled) return
            setFigures(resp.figures)
        })()
        return (() => {
            canceled = true
        })
    }, [userId, updateCode])
    const refreshFigures = useCallback(() => {
        incrementUpdateCode()
    }, [incrementUpdateCode])
    const deleteFigure = useCallback((figureId: string) => {
        if (!userId) return
        if (!googleIdToken) return
        ;(async () => {
            const req: DeleteFigureRequest = {
                type: 'deleteFigure',
                ownerId: userId.toString(),
                figureId,
                auth: {
                    userId: userId.toString(),
                    googleIdToken
                }
            }
            const resp = await postFigureRequest(req, {reCaptcha: true})
            if (!isDeleteFigureResponse(resp)) {
                throw Error('Unexpected response to deleteFigure')
            }
            refreshFigures()
        })()
    }, [refreshFigures, userId, googleIdToken])
    return {figures, deleteFigure, refreshFigures}
}

const columns = [
    {
        key: 'folder',
        label: 'Folder'
    },
    {
        key: 'label',
        label: 'Label'
    },
    {
        key: 'viewUri',
        label: 'View'
    },
    {
        key: 'description',
        label: 'Description'
    }
]

const SavedFiguresTable: FunctionComponent<Props> = () => {
    const {userId, googleIdToken} = useSignedIn()
    const {figures, deleteFigure} = useFigures(userId, googleIdToken)
    const rows = useMemo(() => (
        figures ? figures.map(figure => (
            {
                key: figure.figureId || '',
                columnValues: {
                    folder: figure.folder,
                    label: {
                        text: figure.label,
                        element: <Hyperlink href={`/f?${figure.queryString}`}>{figure.label || '<no label>'}</Hyperlink>
                    },
                    viewUri: figure.viewUri,
                    description: figure.description
                }
            }
        )) : []
    ), [figures])

    const handleDeleteFigure = useCallback((figureId: string) => {
        deleteFigure(figureId)
    }, [deleteFigure])

    return (
        <div>
            <h2>Saved figures</h2>
            <NiceTable
                rows={rows}
                columns={columns}
                onDeleteRow={handleDeleteFigure}
            />
        </div>
    )
}

export default SavedFiguresTable