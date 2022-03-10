import { Button, Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import { useSignedIn } from 'commonComponents/googleSignIn/GoogleSignIn';
import { useRoute2 } from 'figurl/Figure2/Figure2';
import { AddFigureRequest, isAddFigureResponse } from 'miscTypes/FigureRequest';
import postFigureRequest from 'miscTypes/postFigureRequest';
import QueryString from 'querystring';
import React, { FunctionComponent, useCallback, useState } from 'react';
import EditDescriptionControl from './EditDescriptionControl';
import EditFolderControl from './EditFolderControl';
import EditLabelControl from './EditLabelControl';

type Props = {
    onClose: () => void
}

const SaveFigureDialog: FunctionComponent<Props> = ({onClose}) => {
    const {queryString, viewUri, figureDataHash, channelName, label} = useRoute2()
    const {userId, googleIdToken} = useSignedIn()
    const [editLabel, setEditLabel] = useState<string>(label)
    const [folder, setFolder] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const handleSave = useCallback(() => {
        if (!userId) return
        if (!googleIdToken) return
        if (!figureDataHash) return
        if (!viewUri) return
        if (!channelName) return
        const query = QueryString.parse(queryString)
        query['label'] = editLabel
        const queryString2 = createQueryString(query).slice(1)
        ;(async () => {
            const req: AddFigureRequest = {
                type: 'addFigure',
                figure: {
                    ownerId: userId.toString(),
                    folder,
                    queryString: queryString2,
                    dataHash: figureDataHash,
                    viewUri,
                    channel: channelName.toString(),
                    label: editLabel,
                    description
                },
                auth: {
                    userId: userId.toString(),
                    googleIdToken
                }
            }
            const resp = await postFigureRequest(req, {reCaptcha: true})
            if (!isAddFigureResponse(resp)) {
                throw Error('Invalid response to addFigure')
            }
            if (!resp.figureId) {
                throw Error('Problem with figureId')
            }
            onClose()
        })()
    }, [channelName, figureDataHash, editLabel, queryString, userId, googleIdToken, onClose, viewUri, folder, description])
    return (
        <div>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>Label</TableCell>
                        <TableCell><EditLabelControl label={editLabel} setLabel={setEditLabel} /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>View URI</TableCell>
                        <TableCell>{viewUri}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Data hash</TableCell>
                        <TableCell>{figureDataHash}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Channel</TableCell>
                        <TableCell>{channelName}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>{userId}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Folder</TableCell>
                        <TableCell><EditFolderControl folder={folder} setFolder={setFolder} /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell><EditDescriptionControl description={description} setDescription={setDescription} /></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Button onClick={handleSave}>
                Save figure
            </Button>
        </div>
    )
}

const createQueryString = (params: { [key: string]: string | string[] }) => {
    const keys = Object.keys(params)
    if (keys.length === 0) return ''
    return '?' + (
        keys.map((key) => {
            const v = params[key]
            if (typeof(v) === 'string') {
                return encodeURIComponent(key) + '=' + v
            }
            else {
                return v.map(a => (encodeURIComponent(key) + '=' + a)).join('&')
            }
        }).join('&')
    )
}

export default SaveFigureDialog