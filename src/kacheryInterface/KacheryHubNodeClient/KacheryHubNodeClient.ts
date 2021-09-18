import axios from "axios"
import { publicKeyToHex, signMessage } from "../../commonInterface/crypto/signatures"
import { NodeChannelMembership, NodeConfig } from "../../kacheryInterface/kacheryHubTypes"
import { GetNodeConfigRequestBody, isGetNodeConfigResponse, KacheryNodeRequest } from '../../kacheryInterface/kacheryNodeRequestTypes'
import { JSONValue, KeyPair, publicKeyHexToNodeId, UserId } from "../../commonInterface/kacheryTypes"

class KacheryHubNodeClient {
    #initialized = false
    #initializing = false
    #onInitializedCallbacks: (() => void)[] = []
    #channelMemberships: NodeChannelMembership[] | undefined = undefined
    constructor(private opts: {keyPair: KeyPair, ownerId: UserId, kacheryHubUrl?: string}) {
    }
    async initialize() {
        if (this.#initialized) return
        if (this.#initializing) {
            return new Promise<void>((resolve) => {
                this.onInitialized(() => {
                    resolve()
                })
            })
        }
        this.#initializing = true

        const reqBody: GetNodeConfigRequestBody = {
            type: 'getNodeConfig',
            nodeId: this.nodeId,
            ownerId: this.opts.ownerId
        }
        const req: KacheryNodeRequest = {
            body: reqBody,
            nodeId: this.nodeId,
            signature: await signMessage(reqBody as any as JSONValue, this.opts.keyPair)
        }
        const x = await axios.post(`${this._kacheryHubUrl()}/api/getNodeConfig`, req)
        const resp = x.data
        if (!isGetNodeConfigResponse(resp)) {
            throw Error('Invalid response in getNodeConfig')
        }
        if (!resp.found) {
            throw Error('Node not found for getNodeConfig')
        }
        const nodeConfig = resp.nodeConfig
        if (!nodeConfig) throw Error('Unexpected, no nodeConfig')
        this.#channelMemberships = nodeConfig.channelMemberships

        this.#initialized = true
        this.#initializing = false
    }
    public get nodeId() {
        return publicKeyHexToNodeId(publicKeyToHex(this.opts.keyPair.publicKey))
    }
    public get channelMemberships() {
        if (!this.#initialized) return undefined
        return this.#channelMemberships || []
    }
    onInitialized(callback: () => void) {
        this.#onInitializedCallbacks.push(callback)
    }
    _kacheryHubUrl() {
        return this.opts.kacheryHubUrl || 'https://kachery-hub.vercel.app'
    }
}

export default KacheryHubNodeClient
