import { FieldValue } from "@google-cloud/firestore";
import randomAlphaString from "../src/commonInterface/util/randomAlphaString";
import { AddCurationMessageRequest, AddCurationMessageResponse } from "../src/miscTypes/CurationRequest";
import firestoreDatabase from "./common/firestoreDatabase";
import { VerifiedReCaptchaInfo } from "./common/verifyReCaptcha";
import { isCurationDocument } from "./createCurationHandler";

const addCurationMessageHandler = async (request: AddCurationMessageRequest, verifiedUserId: string, verifiedReCaptchaInfo: VerifiedReCaptchaInfo): Promise<AddCurationMessageResponse> => {
    if (!verifiedReCaptchaInfo) {
        if (process.env.REACT_APP_RECAPTCHA_KEY) {
            throw Error('Recaptcha info is not verified')
        }
    }
    const db = firestoreDatabase()
    const collection = db.collection('curations')
    const docRef = collection.doc(request.curationId)
    const doc = await docRef.get()
    const obj = doc.data()
    if (!obj) throw Error('Curation not found')
    if (!isCurationDocument(obj)) throw Error('Invalid curation document')
    if (obj.ownerId !== verifiedUserId) {
        throw Error('Not authorized to add message')
    }
    const messageId = randomAlphaString(10)
    const message = {
        timestamp: FieldValue.serverTimestamp(),
        messageId,
        messageBody: request.messageBody
    }

    const messagesCollection = docRef.collection('messages')
    await messagesCollection.doc().set(message)

    return {
        type: 'addCurationMessage'
    }
}

export default addCurationMessageHandler