import { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import { isBitwooderResourceRequest, isBitwooderResourceResponse } from '../src/bitwooderInterface/BitwooderResourceRequest'

// const keyPair = getKeyPair()

const bitwooderUrl = 'https://bitwooder.net'
// const bitwooderUrl = 'http://localhost:3001'


module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: messageBody} = req
    if (!isBitwooderResourceRequest(messageBody)) {
        console.warn('Invalid message body', messageBody)
        res.status(400).send(`Invalid message body: ${JSON.stringify(messageBody)}`)
        return
    }
    
    ;(async () => {
        const x = await axios.post(bitwooderUrl + '/api/resource', messageBody)
        const resp = x.data
        if (!isBitwooderResourceResponse(resp)) {
            console.warn(resp)
            throw Error('Invalid response from bitwooder')
        }
        return resp
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}

