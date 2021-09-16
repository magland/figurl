import axios from "axios"
import KacheryNode from "kacheryInterface/core/KacheryNode"
import { BitwooderResourceRequest, BitwooderResourceResponse, isBitwooderResourceResponse } from "bitwooderInterface/BitwooderResourceRequest"
import { KacheryNodeRequestBody } from "kacheryInterface/kacheryNodeRequestTypes"
import { isJSONObject, isJSONValue, isNodeId, isSignature, NodeLabel, Signature, userId } from "commonInterface/kacheryTypes"
import { KacheryHubPubsubMessageBody } from "kacheryInterface/pubsubMessages"
import { useMemo } from "react"
import BrowserKacheryStorageManager from "./BrowserKacheryStorageManager"
import BrowserLocalFeedManager from "./BrowserLocalFeedManager"
import BrowserMutableManager from "./BrowserMutableManager"

const kacheryHubUrl = 'https://kacheryhub.org'
// const kacheryHubUrl = 'http://localhost:3000'
// const kacheryHubUrl = 'https://kacheryhub-magland-spikeforest.vercel.app'

const bitwooderUrl = 'https://bitwooder.net'
// const bitwooderUrl = 'http://localhost:3001'

const useSetupKacheryNode = (nodeLabel: NodeLabel): KacheryNode => {
    const kacheryNode = useMemo(() => {
        const nodeId = process.env.REACT_APP_KACHERY_NODE_ID
        if (!isNodeId(nodeId)) {
            throw Error(`Invalid node ID: ${nodeId}`)
        }
        const sendKacheryNodeRequest = async (requestBody: KacheryNodeRequestBody) => {
            const url = '/api/kacheryNodeRequest'
            const x = await axios.post(url, requestBody)
            const resp = x.data
            if (!isJSONValue(resp)) {
                console.warn(resp)
                throw Error('Problem in response to /api/kacheryNodeRequest')
            }
            return resp
        }
        const sendBitwooderResourceRequest = async (request: BitwooderResourceRequest): Promise<BitwooderResourceResponse> => {
            const url = '/api/bitwooderResourceRequest'
            const x = await axios.post(url, request)
            const resp = x.data
            if (!isBitwooderResourceResponse(resp)) {
                console.warn(resp)
                throw Error('Problem in response to /api/bitwooderResourceRequest')
            }
            return resp
        }
        const signPubsubMessage = async (messageBody: KacheryHubPubsubMessageBody): Promise<Signature> => {
            const url = '/api/signPubsubMessage'
            const x = await axios.post(url, messageBody)
            const resp = x.data
            if (!isJSONObject(resp)) {
                console.warn(resp)
                throw Error('Problem in response to /api/signPubsubMessage')
            }
            const signature = resp.signature
            if (!isSignature(signature)) {
                throw Error('Not a valid signature in response to /api/signPubsubMessage')
            }
            return signature
        }
        const label = nodeLabel
        const kacheryStorageManager = new BrowserKacheryStorageManager()
        const mutableManager = new BrowserMutableManager()
        const localFeedManager = new BrowserLocalFeedManager()
        const x = new KacheryNode({
            verbose: 0,
            nodeId,
            sendKacheryNodeRequest,
            sendBitwooderResourceRequest,
            signPubsubMessage,
            label,
            ownerId: userId('jmagland@flatironinstitute.org'),
            kacheryStorageManager,
            mutableManager,
            localFeedManager,
            opts: {
                kacheryHubUrl,
                bitwooderUrl,
                verifySubfeedMessageSignatures: false
            }
        })
        return x
    }, [nodeLabel])

    return kacheryNode
}

export default useSetupKacheryNode