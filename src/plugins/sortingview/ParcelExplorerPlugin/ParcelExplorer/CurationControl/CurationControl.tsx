import { Button } from '@material-ui/core';
import { useSignedIn } from 'commonComponents/googleSignIn/GoogleSignIn';
import { ChannelName, isSha1Hash } from 'commonInterface/kacheryTypes';
import { Sha1Hash } from 'commonInterface/util/misc';
import useRoute from 'figurl/labbox-react/MainWindow/useRoute';
import { CreateCurationRequest } from 'miscTypes/CurationRequest';
import postCurationRequest from 'miscTypes/postCurationRequest';
import React, { FunctionComponent, useCallback } from 'react';

type Props = {

}

const createCuration = async (a: {
    figureObjectHash: Sha1Hash
    figureChannel: ChannelName
    figureLabel: string,
    userId: string,
    googleIdToken: string
}) => {
    const {figureObjectHash, figureChannel, figureLabel, userId, googleIdToken} = a
    const request: CreateCurationRequest = {
        type: 'createCuration',
        ownerId: userId,
        figureObjectHash,
        figureChannel,
        figureLabel,
        auth: {
            userId,
            googleIdToken
        }
    }
    const response = await postCurationRequest(request, {reCaptcha: true})
    if (response.type !== 'createCuration') throw Error('Unexpected response for createCuration')
    return response.curationId
}

const CurationControl: FunctionComponent<Props> = () => {
    const {userId, googleIdToken} = useSignedIn()
    const {figureLabel, figureObjectOrHash, channel, curationId, setRoute} = useRoute()
    const handleCreateCuration = useCallback(() => {
        if (!userId) return
        if (!googleIdToken) return
        if (!channel) return
        if (!isSha1Hash(figureObjectOrHash)) return
        ;(async () => {
            const curationId = await createCuration({figureChannel: channel, figureLabel: figureLabel || '', figureObjectHash: figureObjectOrHash, userId: userId.toString(), googleIdToken})
            setRoute({curationId: curationId})
        })()
    }, [channel, figureLabel, figureObjectOrHash, userId, googleIdToken, setRoute])
    if (!curationId) {
        if (!userId) {
            return <div>To create a curation, you must first sign in.</div>
        }
        return <Button onClick={handleCreateCuration}>Create a curation</Button>
    }
    return (
        <div>Curation control: {curationId}</div>
    )
}

export default CurationControl