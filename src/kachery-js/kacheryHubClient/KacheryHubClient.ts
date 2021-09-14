import Ably from 'ably'
import BitwooderDelegationCert from 'kachery-js/types/BitwooderDelegationCert'
import logger from "winston";
import { hexToPrivateKey, hexToPublicKey, signMessage, verifySignature } from '../crypto/signatures'
import { BitwooderResourceRequest, BitwooderResourceResponse, GetAblyTokenRequestRequest, GetUploadUrlsRequest } from '../types/BitwooderResourceRequest'
import { PubsubAuth } from "../types/kacheryHubTypes"
import { CreateSignedSubfeedMessageUploadUrlRequestBody, CreateSignedTaskResultUploadUrlRequestBody, GetBitwooderCertForChannelRequestBody, GetChannelConfigRequestBody, GetNodeConfigRequestBody, isCreateSignedSubfeedMessageUploadUrlResponse, isCreateSignedTaskResultUploadUrlResponse, isGetBitwooderCertForChannelResponse, isGetChannelConfigResponse, isGetNodeConfigResponse, KacheryNodeRequestBody, ReportRequestBody } from "../types/kacheryNodeRequestTypes"
import { byteCount, ByteCount, ChannelName, FeedId, JSONValue, NodeId, nodeIdToPublicKeyHex, NodeLabel, pathifyHash, PrivateKeyHex, PubsubChannelName, Sha1Hash, SubfeedHash, TaskId, urlString, UserId } from "../types/kacheryTypes"
import { isKacheryHubPubsubMessageData, KacheryHubPubsubMessageBody } from '../types/pubsubMessages'
import randomAlphaString from '../util/randomAlphaString'
import { AblyAuthCallback, AblyAuthCallbackCallback } from "./AblyPubsubClient"
import createPubsubClient, { PubsubClient, PubsubMessage } from "./createPubsubClient"

export type IncomingKacheryHubPubsubMessage = {
    channelName: ChannelName,
    pubsubChannelName: PubsubChannelName,
    fromNodeId: NodeId,
    message: KacheryHubPubsubMessageBody
}

const minuteMsec = 1000 * 60

class KacheryHubClient {
    #pubsubClients: {[key: string]: PubsubClient} = {}
    #incomingPubsubMessageCallbacks: {[key: string]: (x: IncomingKacheryHubPubsubMessage) => void} = {}
    #bitwooderCertsByChannel: {[key: string]: {cert: BitwooderDelegationCert, key: PrivateKeyHex}} = {}
    constructor(private opts: {
        nodeId: NodeId,
        sendKacheryNodeRequest: (message: KacheryNodeRequestBody) => Promise<JSONValue>,
        sendBitwooderResourceRequest: (request: BitwooderResourceRequest) => Promise<BitwooderResourceResponse>,
        ownerId?: UserId,
        nodeLabel?: NodeLabel,
        kacheryHubUrl: string
        bitwooderUrl: string
    }) {
    }
    async fetchNodeConfig() {
        if (!this.opts.ownerId) throw Error('No owner ID in fetchNodeConfig')
        const reqBody: GetNodeConfigRequestBody = {
            type: 'getNodeConfig',
            nodeId: this.nodeId,
            ownerId: this.opts.ownerId
        }
        const resp = await this._sendRequest(reqBody)
        if (!isGetNodeConfigResponse(resp)) {
            throw Error('Invalid response in getNodeConfig')
        }
        if (!resp.found) {
            throw Error('Node not found for getNodeConfig')
        }
        const nodeConfig = resp.nodeConfig
        if (!nodeConfig) throw Error('Unexpected, no nodeConfig')
        return nodeConfig
    }
    async fetchChannelConfig(channelName: ChannelName) {
        const reqBody: GetChannelConfigRequestBody = {
            type: 'getChannelConfig',
            channelName
        }
        const resp = await this._sendRequest(reqBody)
        if (!isGetChannelConfigResponse(resp)) {
            throw Error('Invalid response in getChannelConfig')
        }
        if (!resp.found) {
            throw Error('Channel not found for getChannelConfig')
        }
        const channelConfig = resp.channelConfig
        if (!channelConfig) throw Error('Unexpected, no channelConfig')
        return channelConfig
    }
    async getBitwooderCertForChannel(channelName: ChannelName): Promise<{cert: BitwooderDelegationCert, key: PrivateKeyHex}> {
        if (!this.opts.ownerId) throw Error('No owner ID in getBitwooderCertForChannel')
        let a: {cert: BitwooderDelegationCert, key: PrivateKeyHex} | undefined = this.#bitwooderCertsByChannel[channelName.toString()]
        if (a) {
            if (a.cert.payload.expires < Date.now() + 4000) { // give the expiration a buffer
                a = undefined
            }
        }
        if (a) return a
        // todo: there is a race condition - we may make several requests before we find it in the memory cache
        const reqBody: GetBitwooderCertForChannelRequestBody = {
            type: 'getBitwooderCertForChannel',
            nodeId: this.nodeId,
            ownerId: this.opts.ownerId,
            channelName
        }
        const resp = await this._sendRequest(reqBody)
        if (!isGetBitwooderCertForChannelResponse(resp)) {
            throw Error('Invalid response in getBitwooderCertForChannel')
        }
        a = {cert: resp.cert, key: resp.key}
        this.#bitwooderCertsByChannel[channelName.toString()] = a
        return a
    }
    async fetchPubsubAuthForChannel(channelName: ChannelName): Promise<PubsubAuth> {
        if (!this.opts.ownerId) throw Error('No owner ID in fetchPubsubAuthForChannel')
        const channelConfig = await this.fetchChannelConfig(channelName)
        const resourceId = channelConfig.bitwooderResourceId
        if (!resourceId) {
            throw Error('No bitwooderResourceId in channel config (fetchPubsubAuthForChannel)')
        }
        const {cert: bitwooderCert, key: bitwooderCertKey} = await this.getBitwooderCertForChannel(channelName)
        const ablyCapability = bitwooderCert.payload.attributes.ablyCapability
        if (!ablyCapability) {
            throw Error('No ablyCapability in bitwooder cert')
        }
        const payload = {
            type: 'getAblyTokenRequest' as 'getAblyTokenRequest',
            expires: Date.now() + minuteMsec * 1,
            resourceId,
            capability: ablyCapability
        }
        const keyPair = {
            publicKey: hexToPublicKey(bitwooderCert.payload.delegatedSignerId),
            privateKey: hexToPrivateKey(bitwooderCertKey)
        }
        const req: GetAblyTokenRequestRequest = {
            type: 'getAblyTokenRequest',
            payload,
            auth: {
                signerId: bitwooderCert.payload.delegatedSignerId,
                signature: await signMessage(payload, keyPair),
                delegationCertificate: bitwooderCert
            }
        }
        const resp: BitwooderResourceResponse = await this._sendRequestToBitwooder(req)
        if (resp.type !== 'getAblyTokenRequest') {
            throw Error('Unexpected response type for getAblyTokenRequest')
        }
        return {
            ablyTokenRequest: resp.ablyTokenRequest
        }

        // const reqBody: GetPubsubAuthForChannelRequestBody = {
        //     type: 'getPubsubAuthForChannel',
        //     nodeId: this.nodeId,
        //     ownerId: this.opts.ownerId,
        //     channelName
        // }
        // const pubsubAuth = await this._sendRequest(reqBody)
        // if (!isPubsubAuth(pubsubAuth)) {
        //     console.warn(pubsubAuth)
        //     throw Error('Invalid pubsub auth')
        // }
        // return pubsubAuth
    }
    async report() {
        if (!this.opts.ownerId) throw Error('No owner ID in report')
        if (!this.opts.nodeLabel) throw Error('No node label in report')
        const reqBody: ReportRequestBody = {
            type: 'report',
            nodeId: this.nodeId,
            ownerId: this.opts.ownerId,
            nodeLabel: this.opts.nodeLabel
        }
        await this._sendRequest(reqBody)
    }
    async _createSignedUploadUrl(a: {channelName: ChannelName, filePath: string, size: ByteCount}) {
        const {channelName, filePath, size} = a
        return (await this._createSignedUploadUrls({channelName, filePaths: [filePath], sizes: [size]}))[0]
    }
    async _createSignedUploadUrls(a: {channelName: ChannelName, filePaths: string[], sizes: ByteCount[]}) {
        const {channelName, filePaths, sizes} = a
        if (!this.opts.ownerId) throw Error('No owner ID in createSignedFileUploadUrl')
        
        const channelConfig = await this.fetchChannelConfig(channelName)
        const resourceId = channelConfig.bitwooderResourceId
        if (!resourceId) {
            throw Error('No bitwooderResourceId in channel config (createSignedFileUploadUrl)')
        }
        
        const {cert: bitwooderCert, key: bitwooderCertKey} = await this.getBitwooderCertForChannel(channelName)

        const payload = {
            type: 'getUploadUrls' as 'getUploadUrls',
            expires: Date.now() + minuteMsec * 1,
            resourceId,
            filePaths: filePaths.map((filePath) => (`${channelName}/${filePath}`)), 
            sizes: sizes.map((s) => (Number(s)))
        }

        const keyPair = {
            publicKey: hexToPublicKey(bitwooderCert.payload.delegatedSignerId),
            privateKey: hexToPrivateKey(bitwooderCertKey)
        }
        const req: GetUploadUrlsRequest = {
            type: 'getUploadUrls',
            payload,
            auth: {
                signerId: bitwooderCert.payload.delegatedSignerId,
                signature: await signMessage(payload, keyPair),
                delegationCertificate: bitwooderCert
            }
        }

        const resp: BitwooderResourceResponse = await this._sendRequestToBitwooder(req)
        if (resp.type !== 'getUploadUrls') {
            throw Error('Unexpected response type for getUploadUrl')
        }
        return resp.uploadUrls.map((u) => (urlString(u)))
    }
    async createSignedFileUploadUrl(a: {channelName: ChannelName, sha1: Sha1Hash, size: ByteCount}) {
        if (!this.opts.ownerId) throw Error('No owner ID in createSignedFileUploadUrl')
        const {channelName, sha1, size} = a

        const s = sha1
        const filePath = `sha1/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`

        return await this._createSignedUploadUrl({channelName, filePath, size})
        
        // const {channelName, sha1, size} = a
        // const reqBody: CreateSignedFileUploadUrlRequestBody = {
        //     type: 'createSignedFileUploadUrl',
        //     nodeId: this.nodeId,
        //     ownerId: this.opts.ownerId,
        //     channelName,
        //     sha1,
        //     size
        // }
        // const x = await this._sendRequest(reqBody)
        // if (!isCreateSignedFileUploadUrlResponse(x)) {
        //     throw Error('Unexpected response for createSignedFileUploadUrl')
        // }
        // return x.signedUrl
    }
    async createSignedSubfeedJsonUploadUrl(a: {channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash, size: ByteCount}) {
        const {channelName, feedId, subfeedHash, size} = a
        if (!this.opts.ownerId) throw Error('No owner ID in createSignedSubfeedJsonUploadUrl')

        const f = feedId.toString()
        const s = subfeedHash.toString()
        const subfeedPath = `feeds/${f[0]}${f[1]}/${f[2]}${f[3]}/${f[4]}${f[5]}/${f}/subfeeds/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`
        const subfeedJsonPath = `${subfeedPath}/subfeed.json`
        const uploadUrl = await this._createSignedUploadUrl({channelName, filePath: subfeedJsonPath, size})
        return uploadUrl
    }
    async createSignedSubfeedMessageUploadUrls(a: {channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash, messageNumberRange: [number, number], messageSizes: ByteCount[]}) {
        const {channelName, feedId, subfeedHash, messageNumberRange, messageSizes} = a
        if (!this.opts.ownerId) throw Error('No owner ID in createSignedSubfeedMessageUploadUrls')

        const filePaths: string[] = []
        const f = feedId.toString()
        const s = subfeedHash.toString()
        const subfeedPath = `feeds/${f[0]}${f[1]}/${f[2]}${f[3]}/${f[4]}${f[5]}/${f}/subfeeds/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`
        for (let i = messageNumberRange[0]; i < messageNumberRange[1]; i++) {
            filePaths.push(
                `${subfeedPath}/${i}`
            )
        }
        const sizes = messageSizes
        const uploadUrls = await this._createSignedUploadUrls({channelName, filePaths, sizes})
        return uploadUrls
    }
    async createSignedTaskResultUploadUrl(a: {channelName: ChannelName, taskId: TaskId, size: ByteCount}) {
        if (!this.opts.ownerId) throw Error('No owner ID in createSignedTaskResultUploadUrl')
        const {channelName, taskId, size} = a

        const x = taskId
        const filePath = `task_results/${x[0]}${x[1]}/${x[2]}${x[3]}/${x[4]}${x[5]}/${x}`
        const uploadUrl = await this._createSignedUploadUrl({channelName, filePath, size})

        return uploadUrl
    }
    public get nodeId() {
        return this.opts.nodeId
    }
    clearPubsubClientsForChannels() {
        for (let k in this.#pubsubClients) {
            const client = this.#pubsubClients[k]
            client.unsubscribe()
        }
        this.#pubsubClients = {}
    }
    createPubsubClientForChannel(channelName: ChannelName, subscribeToPubsubChannels: PubsubChannelName[]) {
        if (channelName.toString() in this.#pubsubClients) {
            // todo: think about how to update the subscriptions of the auth has changed
            return
        }
        const ablyAuthCallback: AblyAuthCallback = (tokenParams: Ably.Types.TokenParams, callback: AblyAuthCallbackCallback) => {
            // We ignore tokenParams because the capabilities are determined on the server side
            this.fetchPubsubAuthForChannel(channelName).then((auth: PubsubAuth) => {
                callback('', auth.ablyTokenRequest)
            }).catch((err: Error) => {
                callback(err.message, '')
            })
        }
        const client = createPubsubClient({ably: {ablyAuthCallback}})
        for (let pubsubChannelName of subscribeToPubsubChannels) {
            client.getChannel(pubsubChannelName).subscribe((msg: PubsubMessage) => {
                const messageData = msg.data
                if (isKacheryHubPubsubMessageData(messageData)) {
                    const publicKey = hexToPublicKey(nodeIdToPublicKeyHex(messageData.fromNodeId))
                    verifySignature(messageData.body as any as JSONValue, publicKey, messageData.signature).then(verified => {
                        if (!verified) {
                            logger.warn(`Problem verifying signature on pubsub message: channel=${channelName} pubsubChannelName=${pubsubChannelName}`, messageData.fromNodeId)
                            return
                        }
                        for (let k in this.#incomingPubsubMessageCallbacks) {
                            const cb = this.#incomingPubsubMessageCallbacks[k]
                            cb({
                                channelName,
                                pubsubChannelName,
                                fromNodeId: messageData.fromNodeId,
                                message: messageData.body
                            })
                        }
                    }).catch(err => {
                        logger.warn('Problem verifying signature on pubsub message', err)
                    })
                }
                else {
                    logger.warn(`Invalid pubsub message data: channel=${channelName}, pubsubChannel=${pubsubChannelName}`)
                }
            })
        }
        this.#pubsubClients[channelName.toString()] = client
    }
    getPubsubClientForChannel(channelName: ChannelName) {
        if (channelName.toString() in this.#pubsubClients) {
            return this.#pubsubClients[channelName.toString()]
        }
        else {
            return undefined
        }
    }
    onIncomingPubsubMessage(cb: (x: IncomingKacheryHubPubsubMessage) => void) {
        const k = randomAlphaString(10)
        this.#incomingPubsubMessageCallbacks[k] = cb
        return {cancel: () => {
            if (this.#incomingPubsubMessageCallbacks[k]) {
                delete this.#incomingPubsubMessageCallbacks[k]
            }
        }}
    }
    async _sendRequest(requestBody: KacheryNodeRequestBody): Promise<JSONValue> {
        return await this.opts.sendKacheryNodeRequest(requestBody)
    }
    async _sendRequestToBitwooder(request: BitwooderResourceRequest): Promise<BitwooderResourceResponse> {
        return await this.opts.sendBitwooderResourceRequest(request)
    }
    _kacheryHubUrl() {
        return this.opts.kacheryHubUrl
    }
    _bitwooderUrl() {
        return this.opts.bitwooderUrl
    }
}

export default KacheryHubClient
