import axios from "axios"
import { FigureRequest, FigureResponse } from "./FigureRequest"
import { getReCaptchaToken } from "./reCaptcha"

const postFigureRequest = async (request: FigureRequest, opts: {reCaptcha: boolean}): Promise<FigureResponse> => {
    let request2: FigureRequest = request
    if (opts.reCaptcha) {
        if ((request.type === 'addFigure') || (request.type === 'deleteFigure')) {
            const reCaptchaToken = await getReCaptchaToken()
            request2 = {...request, auth: {...request.auth, reCaptchaToken}}
        }
        else throw Error(`No reCaptcha needed for request of type ${request.type}`)
    }
    try {
        const x = await axios.post('/api/figures', request2)
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

export default postFigureRequest