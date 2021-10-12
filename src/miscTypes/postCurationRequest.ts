import axios from "axios"
import { CurationRequest, CurationResponse } from "./CurationRequest"
import { getReCaptchaToken } from "./reCaptcha"

const postCurationRequest = async (request: CurationRequest, opts: {reCaptcha: boolean}): Promise<CurationResponse> => {
    let request2: CurationRequest = request
    if (opts.reCaptcha) {
        if ((request.type === 'createCuration') || (request.type === 'addCurationMessage')) {
            const reCaptchaToken = await getReCaptchaToken()
            request2 = {...request, auth: {...request.auth, reCaptchaToken}}
        }
        else throw Error(`No reCaptcha needed for request of type ${request.type}`)
    }
    try {
        const x = await axios.post('/api/curation', request2)
        return x.data
    }
    catch(err: any) {
        if (err.response) {
            console.log(err.response)
            throw Error(err.response.data)
        }
        else throw err
    }
}

export default postCurationRequest