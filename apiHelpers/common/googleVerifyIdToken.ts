import {OAuth2Client} from 'google-auth-library'
import { isString } from '../../src/commonInterface/kacheryTypes';

const REACT_APP_GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID
if (!REACT_APP_GOOGLE_CLIENT_ID) {
    throw Error('Environment variable not set: REACT_APP_CLIENT_ID')
}

const client = new OAuth2Client(REACT_APP_GOOGLE_CLIENT_ID);
const googleVerifyIdToken = async (userId: string, token: string) => {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: REACT_APP_GOOGLE_CLIENT_ID
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  })
  const payload = ticket.getPayload()
  if (!payload) throw Error('No payload for ticket')
  const userEmail = payload['email']
  if (!userEmail) throw Error('No email in payload of token payload')
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
  if (userEmail !== userId.toString()) {
    console.warn(userEmail, userId)
    throw Error('Mismatch between auth user id and verified user id')
  }
  if (!isString(userEmail)) throw Error(`Not a valid user id: ${userEmail}`)
  return userEmail as any as string
}

export default googleVerifyIdToken