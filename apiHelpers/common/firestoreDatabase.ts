import {Firestore} from '@google-cloud/firestore'
import { isGoogleServiceAccountCredentials } from './GoogleServiceAccountCredentials'

let db: Firestore | null = null

const GOOGLE_CREDENTIALS = process.env.GOOGLE_CREDENTIALS
if (!GOOGLE_CREDENTIALS) {
    throw Error('Environment variable not set: GOOGLE_CREDENTIALS')
}

const firestoreDatabase = () => {
    if (!db) {
        const googleCredentials = JSON.parse(GOOGLE_CREDENTIALS)
        if (!isGoogleServiceAccountCredentials(googleCredentials)) {
            throw Error('Invalid google credentials.')
        }
        db = new Firestore({
            projectId: googleCredentials.project_id,
            credentials: {
                client_email: googleCredentials.client_email,
                private_key: googleCredentials.private_key
            }
        })
    }
    return db
}

export default firestoreDatabase