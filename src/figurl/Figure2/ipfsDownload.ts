import axios from 'axios';
import { isBoolean, isEqualTo, isNodeId, isNumber, isSignature, isString, NodeId, optional, Signature, _validateObject } from 'commonInterface/kacheryTypes';

export type FindIpfsFileRequest = {
    payload: {
        type: 'findIpfsFile'
        timestamp: number
        cid: string
        projectId?: string
    }
    fromClientId?: NodeId
    signature?: Signature
}

export const isFindIpfsFileRequest = (x: any): x is FindIpfsFileRequest => {
    const isPayload = (y: any) => {
        return _validateObject(y, {
            type: isEqualTo('findIpfsFile'),
            timestamp: isNumber,
            cid: isString,
            projectId: optional(isString)
        })
    }
    return _validateObject(x, {
        payload: isPayload,
        fromClientId: optional(isNodeId),
        signature: optional(isSignature)
    })
}

export type FindIpfsFileResponse = {
    type: 'findIpfsFile'
    found: boolean
    projectId?: string
    size?: number
    url?: string
}

export const isFindIpfsFileResponse = (x: any): x is FindIpfsFileResponse => {
    return _validateObject(x, {
        type: isEqualTo('findIpfsFile'),
        found: isBoolean,
        projectId: optional(isString),
        size: optional(isNumber),
        url: optional(isString)
    })
}

const ipfsDownload = async (cid: string) => {
    const url = 'https://cloud.kacheryhub.org/api/kacherycloud'
    // const url = 'http://localhost:3001/api/kacherycloud'
    const req: FindIpfsFileRequest = {
        payload: {
            type: 'findIpfsFile',
            timestamp: Date.now(),
            cid
        }
    }
    const x = await axios.post(url, req)
    const resp = x.data
    if (!isFindIpfsFileResponse(resp)) {
        console.warn(resp)
        throw Error('Unexpected findIpfsFile response')
    }
    let downloadUrl: string
    if ((resp.found) && (resp.url)) {
        downloadUrl = resp.url
    }
    else {
        downloadUrl = `https://cloudflare-ipfs.com/ipfs/${cid}`
    }
    const y = await axios.get(downloadUrl, {responseType: 'json'})
    return y.data
}

export default ipfsDownload