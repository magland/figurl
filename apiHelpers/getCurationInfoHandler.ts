import { GetCurationInfoRequest, GetCurationInfoResponse } from "../src/miscTypes/CurationRequest"
import firestoreDatabase from "./common/firestoreDatabase"
import { isCurationDocument } from "./createCurationHandler"

const getCurationInfoHandler = async (request: GetCurationInfoRequest): Promise<GetCurationInfoResponse> => {
    const db = firestoreDatabase()
    const collection = db.collection('curations')
    const docRef = collection.doc(request.curationId)
    const doc = await docRef.get()
    const obj = doc.data()
    if (!obj) throw Error('Curation not found')
    if (!isCurationDocument(obj)) throw Error('Invalid curation document')
    return {
        type: 'getCurationInfo',
        curationId: obj.curationId,
        ownerId: obj.ownerId,
        figureObjectHash: obj.figureObjectHash,
        figureChannel: obj.figureChannel,
        figureLabel: obj.figureLabel
    }
}

export default getCurationInfoHandler