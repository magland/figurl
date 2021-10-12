import { JSONValue } from "../src/commonInterface/kacheryTypes";
import { GetCurationMessagesRequest, GetCurationMessagesResponse } from "../src/miscTypes/CurationRequest";
import firestoreDatabase from "./common/firestoreDatabase";

const getCurationMessagesHandler = async (request: GetCurationMessagesRequest): Promise<GetCurationMessagesResponse> => {
    const db = firestoreDatabase()
    const collection = db.collection('curations')
    const docRef = collection.doc(request.curationId)
    const doc = await docRef.get()
    const obj = doc.data()
    if (!obj) throw Error('Curation not found')
    const messagesCollection = docRef.collection('messages')
    const results = await messagesCollection.where('timestamp', '>=', request.startTimestamp).get()
    const messages: {
        timestamp: number,
        messageId: string,
        messageBody: JSONValue
    }[] = []
    for (let doc of results.docs) {
        const obj = doc.data()
        messages.push({
            timestamp: obj.timestamp,
            messageId: obj.messageId,
            messageBody: obj.messageBody
        })
    }
    return {
        type: 'getCurationMessages',
        messages
    }
}

export default getCurationMessagesHandler