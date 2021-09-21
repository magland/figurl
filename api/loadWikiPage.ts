import { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import randomAlphaString from '../src/commonInterface/util/randomAlphaString'
import { isLoadWikiPageRequest } from '../src/miscTypes/LoadWikiPageRequest'

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isLoadWikiPageRequest(request)) {
        console.warn('Invalid loadWikiPage request')
        res.status(400).send(`Invalid message body`)
        return
    }
    
    ;(async () => {
        const {user, repo, page} = request
        const cb = randomAlphaString(5)
        const url = `https://raw.githubusercontent.com/wiki/${user}/${repo}/${page}.md?cb=${cb}`
        const resp = await axios.get(url, {responseType: 'text'})
        const content = resp.data
        return {type: 'loadWikiPage', content}
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}

