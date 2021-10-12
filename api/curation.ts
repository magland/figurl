import { VercelRequest, VercelResponse } from '@vercel/node'
import verifyReCaptcha, { VerifiedReCaptchaInfo } from '../apiHelpers/common/verifyReCaptcha'
import createCurationHandler from '../apiHelpers/createCurationHandler'
import { JSONValue } from '../src/commonInterface/kacheryTypes'
import {Auth, isCurationRequest} from '../src/miscTypes/CurationRequest'
import googleVerifyIdToken from '../apiHelpers/common/googleVerifyIdToken'
import addCurationMessageHandler from '../apiHelpers/addCurationMessageHandler'
import getCurationMessagesHandler from '../apiHelpers/getCurationMessagesHandler'
import getCurationInfoHandler from '../apiHelpers/getCurationInfoHandler'

const verifyAuth = async (auth: Auth) => {
    const {userId, googleIdToken, reCaptchaToken} = auth
    if ((userId) && (!googleIdToken)) throw Error('No google id token')
    const verifiedUserId = userId ? await googleVerifyIdToken(userId, googleIdToken) : ''
    const verifiedReCaptchaInfo: VerifiedReCaptchaInfo | undefined = await verifyReCaptcha(reCaptchaToken)
    return {verifiedUserId, verifiedReCaptchaInfo}
}

module.exports = (req: VercelRequest, res: VercelResponse) => {
    const {body: requestBody} = req
    if (!isCurationRequest(requestBody)) {
        console.warn('Invalid request body', requestBody)
        res.status(400).send(`Invalid request body: ${JSON.stringify(requestBody)}`)
        return
    }
    ;(async () => {
        if (requestBody.type === 'createCuration') {
            const {verifiedUserId, verifiedReCaptchaInfo} = await verifyAuth(requestBody.auth)
            return await createCurationHandler(requestBody, verifiedUserId, verifiedReCaptchaInfo)
        }
        else if (requestBody.type === 'addCurationMessage') {
            const {verifiedUserId, verifiedReCaptchaInfo} = await verifyAuth(requestBody.auth)
            return await addCurationMessageHandler(requestBody, verifiedUserId, verifiedReCaptchaInfo)
        }
        else if (requestBody.type === 'getCurationMessages') {
            return await getCurationMessagesHandler(requestBody)
        }
        else if (requestBody.type === 'getCurationInfo') {
            return await getCurationInfoHandler(requestBody)
        }
        else {
            throw Error(`Unexpected curation request: ${requestBody.type}`)
        }
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}
