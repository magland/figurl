import { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import randomAlphaString from '../src/commonInterface/util/randomAlphaString'
import { isLoadGistRequest } from '../src/miscTypes/LoadGistRequest'

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isLoadGistRequest(request)) {
        console.warn('Invalid loadGist request')
        res.status(400).send(`Invalid message body`)
        return
    }
    
    ;(async () => {
        const cb = randomAlphaString(5)
        const {user, id, file} = request
        const url = `https://gist.githubusercontent.com/${user}/${id}/raw/${file}?cb=${cb}`
        const resp = await axios.get(url, {responseType: 'text'})
        const content = resp.data
        return {type: 'loadGist', content}
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}

