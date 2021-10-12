import { ChannelName, isChannelName, isSha1Hash, isString, Sha1Hash, _validateObject } from "../src/commonInterface/kacheryTypes";
import randomAlphaString from "../src/commonInterface/util/randomAlphaString";
import { CreateCurationRequest, CreateCurationResponse } from "../src/miscTypes/CurationRequest";
import firestoreDatabase from './common/firestoreDatabase'
import { VerifiedReCaptchaInfo } from "./common/verifyReCaptcha";

export type CurationDocument = {
    curationId: string
    ownerId: string
    figureObjectHash: Sha1Hash
    figureChannel: ChannelName
    figureLabel: string
}

export const isCurationDocument = (x: any): x is CurationDocument => {
    return _validateObject(x, {
        curationId: isString,
        ownerId: isString,
        figureObjectHash: isSha1Hash,
        figureChannel: isChannelName,
        figureLabel: isString
    })
}

const createCurationHandler = async (request: CreateCurationRequest, verifiedUserId: string, verifiedReCaptchaInfo: VerifiedReCaptchaInfo): Promise<CreateCurationResponse> => {
    if (!verifiedReCaptchaInfo) {
        if (process.env.REACT_APP_RECAPTCHA_KEY) {
            throw Error('Recaptcha info is not verified')
        }
    }
    if (verifiedUserId !== request.ownerId) {
        throw Error('Not authorized')
    }

    const curationId = randomAlphaString(12)
    const curation: CurationDocument = {
        curationId,
        ownerId: request.ownerId,
        figureObjectHash: request.figureObjectHash,
        figureChannel: request.figureChannel,
        figureLabel: request.figureLabel
    }
    
    const db = firestoreDatabase()
    const collection = db.collection('curations')
    await collection.doc(curationId).set(curation)

    return {
        type: 'createCuration',
        curationId
    }
    
}

export default createCurationHandler