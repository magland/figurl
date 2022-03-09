import { Figure, GetFiguresRequest, GetFiguresResponse, isFigure } from "../src/miscTypes/FigureRequest";
import firestoreDatabase from "./common/firestoreDatabase";

const getFiguresHandler = async (request: GetFiguresRequest): Promise<GetFiguresResponse> => {
    const db = firestoreDatabase()
    const collection = db.collection('figures')
    const results = await collection.where('ownerId', '==', request.ownerId).get()
    const figures: Figure[] = []
    for (let doc of results.docs) {
        const x = doc.data()
        if (isFigure(x)) {
            figures.push(x)
        }
        else {
            console.warn(x)
            console.warn('Invalid figure in database (getFiguresHandler)')
            // await doc.ref.delete() // only delete if we are sure we want to -- don't risk losing data!
        }
    }
    return {
        type: 'getFigures',
        figures
    }
}

export default getFiguresHandler