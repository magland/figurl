import randomAlphaString from "../src/commonInterface/util/randomAlphaString";
import { DeleteFigureRequest, DeleteFigureResponse, Figure, isFigure } from "../src/miscTypes/FigureRequest";
import firestoreDatabase from "./common/firestoreDatabase";
import { VerifiedReCaptchaInfo } from "./common/verifyReCaptcha";

const deleteFigureHandler = async (request: DeleteFigureRequest, verifiedUserId: string, verifiedReCaptchaInfo: VerifiedReCaptchaInfo): Promise<DeleteFigureResponse> => {
    if (!verifiedReCaptchaInfo) {
        if (process.env.REACT_APP_RECAPTCHA_KEY) {
            throw Error('Recaptcha info is not verified')
        }
    }
    if (request.ownerId !== verifiedUserId) {
        throw Error(`Not authorized to delete figure: ${request.ownerId} <> ${verifiedUserId}`)
    }
    const db = firestoreDatabase()
    const collection = db.collection('figures')
    const docRef = collection.doc(request.figureId)
    const doc = await docRef.get()
    if (!doc.exists) {
        throw Error(`Figure does not exist.`)
    }
    const docData = doc.data()
    if (!isFigure(docData)) {
        throw Error(`Invalid figure document`)
    }
    if (docData.ownerId !== request.ownerId) {
        throw Error(`Incorrect figure owner: ${request.ownerId} <> ${docData.ownerId}`)
    }
    await docRef.delete()

    return {
        type: 'deleteFigure'
    }
}

export default deleteFigureHandler