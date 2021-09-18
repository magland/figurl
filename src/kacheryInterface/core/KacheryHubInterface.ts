import axios from "axios";
import { BitwooderResourceRequest, BitwooderResourceResponse } from "../../bitwooderInterface/BitwooderResourceRequest";
import logger from "winston";
import KacheryHubClient, { IncomingKacheryHubPubsubMessage } from "../kacheryHubClient/KacheryHubClient";
import IncomingTaskManager, { ProbeTaskFunctionsResult } from "../tasks/IncomingTaskManager";
import OutgoingTaskManager from "../tasks/outgoingTaskManager";
import { ChannelConfig, NodeChannelMembership, NodeConfig, RegisteredTaskFunction, RequestedTask } from "../kacheryHubTypes";
import { KacheryNodeRequestBody } from "../kacheryNodeRequestTypes";
import { ByteCount, ChannelName, DurationMsec, durationMsecToNumber, elapsedSince, errorMessage, ErrorMessage, FeedId, FileKey, fileKeyHash, isMessageCount, isSignedSubfeedMessage, JSONValue, MessageCount, NodeId, NodeLabel, nowTimestamp, pathifyHash, pubsubChannelName, PubsubChannelName, scaledDurationMsec, Sha1Hash, Signature, SignedSubfeedMessage, SubfeedHash, SubfeedPosition, TaskFunctionId, TaskFunctionType, TaskId, TaskKwargs, TaskStatus, toTaskId, urlString, UrlString, UserId, _validateObject } from "../../commonInterface/kacheryTypes";
import { KacheryHubPubsubMessageBody, KacheryHubPubsubMessageData, ProbeTaskFunctionsBody, RequestFileMessageBody, RequestSubfeedMessageBody, RequestTaskMessageBody, UpdateSubfeedMessageCountMessageBody, UpdateTaskStatusMessageBody, UploadFileStatusMessageBody } from "../pubsubMessages";
import cacheBust from "../../commonInterface/util/cacheBust";
import computeTaskHash from "../../commonInterface/util/computeTaskHash";
import randomAlphaString from "../../commonInterface/util/randomAlphaString";
import NodeStats from "./NodeStats";

type IncomingFileRequestCallback = (args: {fileKey: FileKey, fromNodeId: NodeId, channelName: ChannelName}) => void

type RequestTaskResult = {
    taskId: TaskId
    status: TaskStatus
    taskResultUrl?: UrlString
    errorMessage?: ErrorMessage
    cacheHit?: boolean
}

type WaitForTaskResult = {
    status: TaskStatus
    errorMessage?: ErrorMessage
}

class KacheryHubInterface {
    #kacheryHubClient: KacheryHubClient
    #channelMemberships: NodeChannelMembership[] | undefined = undefined
    #initialized = false
    #initializing = false
    #onInitializedCallbacks: (() => void)[] = []
    #incomingFileRequestCallbacks: IncomingFileRequestCallback[] = []
    #requestSubfeedCallbacks: ((channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash, position: SubfeedPosition) => void)[] = []
    #updateSubfeedMessageCountCallbacks: ((channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash, messageCount: MessageCount) => void)[] = []
    #incomingTaskManager: IncomingTaskManager
    #outgoingTaskManager: OutgoingTaskManager
    constructor(private opts: {
        nodeId: NodeId, 
        sendKacheryNodeRequest: (message: KacheryNodeRequestBody) => Promise<JSONValue>,
        sendBitwooderResourceRequest: (request: BitwooderResourceRequest) => Promise<BitwooderResourceResponse>,
        signPubsubMessage: (messageBody: KacheryHubPubsubMessageBody) => Promise<Signature>,
        ownerId?: UserId,
        nodeLabel?: NodeLabel,
        kacheryHubUrl: string,
        bitwooderUrl: string,
        nodeStats: NodeStats,
        additionalChannels: ChannelName[]
    }) {
        const {nodeId, sendKacheryNodeRequest, sendBitwooderResourceRequest, ownerId, nodeLabel, kacheryHubUrl, bitwooderUrl} = opts
        this.#kacheryHubClient = new KacheryHubClient({nodeId, sendKacheryNodeRequest, sendBitwooderResourceRequest, ownerId, nodeLabel, kacheryHubUrl, bitwooderUrl})
        this.#kacheryHubClient.onIncomingPubsubMessage((x: IncomingKacheryHubPubsubMessage) => {
            logger.debug(`Incoming pubsub message ${x.channelName} ${x.pubsubChannelName} ${x.message.type}`)
            this._handleKacheryHubPubsubMessage(x)
        })
        this.#incomingTaskManager = new IncomingTaskManager()
        this.#outgoingTaskManager = new OutgoingTaskManager()
        this.initialize()
    }
    client() {
        return this.#kacheryHubClient
    }
    async initialize() {
        if (this.#initialized) return
        if (this.#initializing) {
            return new Promise<void>((resolve) => {
                this.#onInitializedCallbacks.push(() => {
                    resolve()
                })
            })
        }
        logger.info('KacheryHubInterface: initializing')
        this.#initializing = true
        await this._doInitialize()
        logger.info('KacheryHubInterface: done initializing')
        this.#initialized = true
        this.#initializing = false
        this.#onInitializedCallbacks.forEach(cb => {cb()})
    }
    async checkForFileInChannelBuckets(sha1: Sha1Hash): Promise<{downloadUrl: UrlString, channelName: ChannelName}[] | null> {
        logger.debug(`KacheryHubInterface: checkForFileInChannelBuckets ${sha1}`)
        await this.initialize()
        if (!this.#channelMemberships) return null
        const options: {downloadUrl: UrlString, channelName: ChannelName}[] = []
        // const checkedBucketUrls = new Set<string>()
        for (let cm of (this.#channelMemberships || [])) {
            const channelName = cm.channelName
            // const bucketUri = cm.channelBucketUri
            // if (bucketUri) {
            //     const bucketUrl = urlFromUri(bucketUri)
            //     if (!checkedBucketUrls.has(bucketUrl)) {
            //         checkedBucketUrls.add(bucketUrl)
            //         const s = sha1.toString()
            //         const url2 = urlString(`${bucketUrl}/sha1/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`)
            //         const exists = await checkUrlExists(url2)
            //         if (exists) {
            //             options.push({downloadUrl: url2, channelName})
            //         }
            //     }
            // }
            const bucketBaseUrl = cm.channelBucketBaseUrl
            if (bucketBaseUrl) {
                const s = sha1.toString()
                const url2 = urlString(`${bucketBaseUrl}/${channelName}/sha1/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`)
                const exists = await checkUrlExists(url2)
                if (exists) {
                    options.push({downloadUrl: url2, channelName})
                }
            }
        }
        return options
    }
    async checkForSubfeedInChannelBucket(feedId: FeedId, subfeedHash: SubfeedHash, channelName: ChannelName): Promise<MessageCount | null> {
        logger.debug(`KacheryHubInterface: checkForSubfeedInChannelBucket ${channelName} ${feedId}/${subfeedHash}`)
        await this.initialize()
        if (!this.#channelMemberships) return null
        // const checkedBucketUrls = new Set<string>()
        for (let cm of (this.#channelMemberships || [])) {
            if (channelName === cm.channelName) {
                // const bucketUri = cm.channelBucketUri
                // if (bucketUri) {
                //     const bucketUrl = urlFromUri(bucketUri)
                //     if (!checkedBucketUrls.has(bucketUrl)) {
                //         checkedBucketUrls.add(bucketUrl)
                //         const f = feedId.toString()
                //         const s = subfeedHash.toString()
                //         const subfeedPath = `feeds/${f[0]}${f[1]}/${f[2]}${f[3]}/${f[4]}${f[5]}/${f}/subfeeds/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`
                //         const url2 = urlString(`${bucketUrl}/${subfeedPath}/subfeed.json`)
                //         const subfeedJson = await downloadJson(url2, {cacheBust: true})
                //         if (subfeedJson) {
                //             if (isSubfeedJson(subfeedJson)) {
                //                 options.push({numMessages: subfeedJson.messageCount, channelName})
                //             }
                //         }
                //     }
                // }
                const bucketBaseUrl = cm.channelBucketBaseUrl
                if (bucketBaseUrl) {
                    const f = feedId.toString()
                    const s = subfeedHash.toString()
                    const subfeedPath = `feeds/${f[0]}${f[1]}/${f[2]}${f[3]}/${f[4]}${f[5]}/${f}/subfeeds/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`
                    const url2 = urlString(`${bucketBaseUrl}/${channelName}/${subfeedPath}/subfeed.json`)
                    const subfeedJson = await downloadJson(url2, {cacheBust: true})
                    if (subfeedJson) {
                        if (isSubfeedJson(subfeedJson)) {
                            return subfeedJson.messageCount
                        }
                    }
                }
            }
        }
        return null
    }
    async requestFileFromChannels(fileKey: FileKey): Promise<boolean> {
        logger.debug(`KacheryHubInterface: requestFileFromChannels ${fileKey.sha1}`)
        await this.initialize()
        if (!this.#channelMemberships) return false
        let status: '' | 'pending' | 'started' | 'finished' = ''
        let stageFromStatus: {[key: string]: number} = {
            '': 0,
            'pending': 1,
            'started': 2,
            'finished': 3
        }
        return new Promise<boolean>((resolve) => {
            let timer = nowTimestamp()
            let complete = false
            const {cancel: cancelListener} = this.#kacheryHubClient.onIncomingPubsubMessage((msg) => {
                if (complete) return
                if ((msg.message.type === 'uploadFileStatus') && (fileKeysMatch(msg.message.fileKey, fileKey))) {
                    const newStatus = msg.message.status
                    const currentStage = stageFromStatus[status]
                    const newStage = stageFromStatus[newStatus]
                    if (newStage > currentStage) {
                        status = newStatus
                        timer = nowTimestamp()
                    }
                    if (status === 'finished') {
                        complete = true
                        cancelListener()
                        resolve(true)
                    }
                }
            })
            for (let cm of (this.#channelMemberships || [])) {
                const au = cm.authorization
                if ((au) && (au.permissions.requestFiles)) {
                    const msg: RequestFileMessageBody = {
                        type: 'requestFile',
                        fileKey
                    }
                    this._publishMessageToPubsubChannel(cm.channelName, pubsubChannelName(`${cm.channelName}-requestFiles`), msg)
                }
            }
            const check = () => {
                if (complete) return
                const _finalize = () => {
                    complete = true
                    cancelListener()
                    resolve(false)
                }
                const elapsed = elapsedSince(timer)
                if (status === '') {
                    if (elapsed > 3000) {
                        _finalize()
                        return
                    }
                }
                else if (status === 'pending') {
                    if (elapsed > 30000) {
                        _finalize()
                        return
                    }
                }
                else if (status === 'started') {
                    if (elapsed > 30000) {
                        _finalize()
                        return
                    }
                }
                setTimeout(check, 1001)
            }
            check()
        })
    }
    onIncomingPubsubMessage(cb: (x: IncomingKacheryHubPubsubMessage) => void) {
        return this.#kacheryHubClient.onIncomingPubsubMessage(cb)
    }
    onIncomingFileRequest(callback: IncomingFileRequestCallback) {
        this.#incomingFileRequestCallbacks.push(callback)
    }
    onRequestSubfeed(cb: (channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash, position: SubfeedPosition) => void) {
        this.#requestSubfeedCallbacks.push(cb)
    }
    onUpdateSubfeedMessageCount(callback: (channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash, messageCount: MessageCount) => void) {
        this.#updateSubfeedMessageCountCallbacks.push(callback)
    }
    async sendUploadFileStatusMessage(args: {channelName: ChannelName, fileKey: FileKey, status: 'started' | 'finished'}) {
        logger.debug(`KacheryHubInterface: sendUploadFileStatusMessage ${args.channelName} ${args.status}`)
        const {channelName, fileKey, status} = args
        await this.initialize()
        const msg: UploadFileStatusMessageBody = {
            type: 'uploadFileStatus',
            fileKey,
            status
        }
        this._publishMessageToPubsubChannel(channelName, pubsubChannelName(`${channelName}-provideFiles`), msg)
    }
    async getChannelMemberships() {
        await this.initialize()
        return this.#channelMemberships
    }
    async createSignedFileUploadUrl(a: {channelName: ChannelName, sha1: Sha1Hash, size: ByteCount}) {
        logger.debug(`KacheryHubInterface: createSignedFileUploadUrl`)
        return this.#kacheryHubClient.createSignedFileUploadUrl(a)
    }
    async createSignedSubfeedJsonUploadUrl(a: {channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash, size: ByteCount}) {
        logger.debug(`KacheryHubInterface: createSignedSubfeedJsonUploadUrl`)
        return this.#kacheryHubClient.createSignedSubfeedJsonUploadUrl(a)
    }
    async createSignedSubfeedMessageUploadUrls(a: {channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash, messageNumberRange: [number, number], messageSizes: ByteCount[]}) {
        logger.debug(`KacheryHubInterface: createSignedSubfeedMessageUploadUrls`)
        return this.#kacheryHubClient.createSignedSubfeedMessageUploadUrls(a)
    }
    async createSignedTaskResultUploadUrl(a: {channelName: ChannelName, taskId: TaskId, size: ByteCount}) {
        logger.debug(`KacheryHubInterface: createSignedTaskResultUploadUrl`)
        return this.#kacheryHubClient.createSignedTaskResultUploadUrl(a)
    }
    async reportToChannelSubfeedMessagesAdded(channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash, numMessages: MessageCount) {
        logger.debug(`KacheryHubInterface: reportToChannelSubfeedMessagesAdded`)
        await this.initialize()
        const msg: UpdateSubfeedMessageCountMessageBody = {
            type: 'updateSubfeedMessageCount',
            feedId,
            subfeedHash,
            messageCount: numMessages
        }
        this._publishMessageToPubsubChannel(channelName, pubsubChannelName(`${channelName}-provideFeeds`), msg)
    }
    async subscribeToRemoteSubfeed(feedId: FeedId, subfeedHash: SubfeedHash, channelName: ChannelName, position: SubfeedPosition) {
        logger.debug(`KacheryHubInterface: subscribeToRemoteSubfeed`)
        await this.initialize()
        if (!this.#channelMemberships) return
        // const channelNames: ChannelName[] = []
        // for (let channelMembership of (this.#channelMemberships || [])) {
        //     if (channelMembership.roles.requestFeeds) {
        //         if ((channelMembership.authorization) && (channelMembership.authorization.permissions.requestFeeds)) {
        //             channelNames.push(channelMembership.channelName)
        //         }
        //     }
        // }
        const msg: RequestSubfeedMessageBody = {
            type: 'requestSubfeed',
            feedId,
            subfeedHash,
            position
        }
        // for (let channelName of channelNames) {
        this._publishMessageToPubsubChannel(channelName, pubsubChannelName(`${channelName}-requestFeeds`), msg)
        // }
    }
    async _requestTaskFromChannel(args: {channelName: ChannelName, taskFunctionId: TaskFunctionId, kwargs: TaskKwargs, taskFunctionType: TaskFunctionType, taskId: TaskId, backendId: string | null}) {
        const {channelName, taskFunctionId, kwargs, taskFunctionType, taskId, backendId} = args
        await this.initialize()
        if (!this.#channelMemberships) {
            throw Error('Problem initializing kacheryhub interface')
        }
        const channelMembership = (this.#channelMemberships || []).filter(cm => (cm.channelName === channelName))[0]
        if (!channelMembership) {
            throw Error(`Not a member of channel: ${channelName}`)
        }
        // roles are deprecated
        // const roles = channelMembership.roles
        const permissions = (channelMembership.authorization || {}).permissions
        if (!permissions) {
            throw Error(`No permissions on channel: ${channelName}`)
        }
        if (!permissions.requestTasks) {
            throw Error(`This node does not have permission to request tasks on channel: ${channelName}`)
        }
        // if (!roles.requestTasks) {
        //     throw Error(`This node does not have role to request tasks on channel: ${channelName}`)
        // }
        const msg: RequestTaskMessageBody = {
            type: 'requestTask',
            backendId,
            taskId,
            taskFunctionId,
            taskFunctionType,
            taskKwargs: kwargs
        }
        this._publishMessageToPubsubChannel(channelName, pubsubChannelName(`${channelName}-requestTasks`), msg)
    }
    async probeTaskFunctionsFromChannel(args: {channelName: ChannelName, taskFunctionIds: TaskFunctionId[], backendId: string | null}) {
        logger.debug(`KacheryHubInterface: probeTaskFunctionsFromChannel`)
        const {channelName, taskFunctionIds, backendId} = args
        await this.initialize()
        if (!this.#channelMemberships) {
            throw Error('Problem initializing kacheryhub interface')
        }
        const channelMembership = (this.#channelMemberships || []).filter(cm => (cm.channelName === channelName))[0]
        if (!channelMembership) {
            throw Error(`Not a member of channel: ${channelName}`)
        }
        // roles are deprecated
        // const roles = channelMembership.roles
        const permissions = (channelMembership.authorization || {}).permissions
        if (!permissions) {
            throw Error(`No permissions on channel: ${channelName}`)
        }
        if (!permissions.requestTasks) {
            throw Error(`This node does not have permission to request tasks (probe task functions) on channel: ${channelName}`)
        }
        // if (!roles.requestTasks) {
        //     throw Error(`This node does not have role to request tasks (probe task functions) on channel: ${channelName}`)
        // }
        const msg: ProbeTaskFunctionsBody = {
            type: 'probeTaskFunctions',
            taskFunctionIds,
            backendId
        }
        this._publishMessageToPubsubChannel(channelName, pubsubChannelName(`${channelName}-requestTasks`), msg)
    }
    getRegisteredTaskFunction(channelName: ChannelName, taskFunctionId: TaskFunctionId) {
        return this.#outgoingTaskManager.getRegisteredTaskFunction(channelName, taskFunctionId)
    }
    clearRegisteredTaskFunctions() {
        this.#outgoingTaskManager.clearRegisteredTaskFunctions()
    }
    onRegisteredTaskFunctionsChanged(cb: () => void) {
	    return this.#outgoingTaskManager.onRegisteredTaskFunctionsChanged(cb)
    }
    async downloadSignedSubfeedMessages(channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash, start: MessageCount, end: MessageCount): Promise<SignedSubfeedMessage[]> {
        logger.debug(`KacheryHubInterface: downloadSignedSubfeedMessages`)
        await this.initialize()
        if (!this.#channelMemberships) {
            throw Error('Problem initializing kacheryhub interface')
        }
        const channelMembership = (this.#channelMemberships || []).filter(cm => (cm.channelName === channelName))[0]
        if (!channelMembership) {
            throw Error(`Not a member of channel: ${channelName}`)
        }
        // const channelBucketUri = channelMembership.channelBucketUri
        // if (!channelBucketUri) {
        //     throw Error(`No bucket uri for channel: ${channelName}`)
        // }
        // const channelBucketName = bucketNameFromUri(channelBucketUri)
        
        
        const bucketBaseUrl = channelMembership.channelBucketBaseUrl
        if (!bucketBaseUrl) {
            throw Error(`No bucket base URL for channel: ${channelName}`)
        }

        const subfeedJson = await this.loadSubfeedJson(channelName, feedId, subfeedHash)
        if (!subfeedJson) {
            throw Error(`Unable to load subfeed.json for subfeed: ${feedId} ${subfeedHash} ${channelName}`)
        }
        let end2 = Number(end)
        if (Number(subfeedJson.messageCount) < Number(end)) {
            end = subfeedJson.messageCount
        }
        const subfeedPath = getSubfeedPath(feedId, subfeedHash)

        // const client = new GoogleObjectStorageClient({bucketName: channelBucketName})

        const ret: SignedSubfeedMessage[] = []
        for (let i = Number(start); i < end2; i++) {
            // const messagePath = `${subfeedPath}/${i}`
            const urlMessage = urlString(`${bucketBaseUrl}/${channelName}/${subfeedPath}/${i}`)
            const messageJson = await downloadJson(urlMessage, {cacheBust: false})
            // const messageJson = await client.getObjectJson(messagePath, {cacheBust: false, nodeStats: this.opts.nodeStats, channelName})
            if (!messageJson) {
                throw Error(`Unable to download subfeed message ${urlMessage} on ${channelName}`)
            }
            if (!isSignedSubfeedMessage(messageJson)) {
                throw Error(`Invalid subfeed message ${urlMessage} on ${channelName}`)
            }
            ret.push(messageJson)
        }
        return ret
    }
    // async getChannelBucketUri(channelName: ChannelName) {
    //     await this.initialize()
    //     const channelMembership = this._getChannelMembership(channelName)
    //     if (!channelMembership) throw Error(`Not a member of channel: ${channelName}`)
    //     const channelBucketUri = channelMembership.channelBucketUri
    //     if (!channelBucketUri) {
    //         throw Error(`No bucket uri for channel: ${channelName}`)
    //     }
    //     return channelBucketUri
    // }
    // async getChannelBucketName(channelName: ChannelName) {
    //     const channelBucketUri = await this.getChannelBucketUri(channelName)
    //     const channelBucketName = bucketNameFromUri(channelBucketUri)
    //     return channelBucketName
    // }
    async getChannelResourceId(channelName: ChannelName) {
        await this.initialize()
        const channelMembership = this._getChannelMembership(channelName)
        if (!channelMembership) throw Error(`Not a member of channel: ${channelName}`)
        const resourceId = channelMembership.channelResourceId
        if (!resourceId) {
            throw Error(`No resource ID for channel: ${channelName}`)
        }
        return resourceId
    }
    async getChannelBucketBaseUrl(channelName: ChannelName) {
        await this.initialize()
        const channelMembership = this._getChannelMembership(channelName)
        if (!channelMembership) throw Error(`Not a member of channel: ${channelName}`)
        const bucketBaseUrl = channelMembership.channelBucketBaseUrl
        if (!bucketBaseUrl) {
            throw Error(`No bucket base URL for channel: ${channelName}`)
        }
        return bucketBaseUrl
    }
    async loadSubfeedJson(channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash) {
        logger.debug(`KacheryHubInterface: Loading subfeed.json`)
        // const channelBucketName = await this.getChannelBucketName(channelName)
        const bucketBaseUrl = await this.getChannelBucketBaseUrl(channelName)
        const subfeedPath = getSubfeedPath(feedId, subfeedHash)
        // const subfeedJsonPath = `${subfeedPath}/subfeed.json`

        const url2 = urlString(`${bucketBaseUrl}/${channelName}/${subfeedPath}/subfeed.json`)
        const subfeedJson = await downloadJson(url2, {cacheBust: true})
        // const client = new GoogleObjectStorageClient({bucketName: channelBucketName})
        // const subfeedJson = await client.getObjectJson(subfeedJsonPath, {cacheBust: true, nodeStats: this.opts.nodeStats, channelName})
        if (!subfeedJson) {
            return null
        }
        if (!isSubfeedJson(subfeedJson)) {
            throw Error(`Problem with subfeed.json for ${subfeedPath} on ${channelName}`)
        }
        logger.debug(`KacheryHubInterface: Got subfeedJson: ${subfeedJson.messageCount} messages`)
        return subfeedJson
    }
    async updateTaskStatus(args: {channelName: ChannelName, taskId: TaskId, status: TaskStatus, errorMessage: ErrorMessage | undefined}) {
        logger.debug(`KacheryHubInterface: updateTaskStatus`)
        const { channelName, taskId, status, errorMessage } = args
        await this.initialize()
        if (!this.#channelMemberships) {
            throw Error('Problem initializing kacheryhub interface')
        }
        const channelMembership = (this.#channelMemberships || []).filter(cm => (cm.channelName === channelName))[0]
        if (!channelMembership) {
            throw Error(`Not a member of channel: ${channelName}`)
        }
        // roles are deprecated
        // const roles = channelMembership.roles
        const permissions = (channelMembership.authorization || {}).permissions
        if (!permissions) {
            throw Error(`No permissions for updating task status for channel: ${channelName}`)
        }
        if (!permissions.provideTasks) {
            throw Error(`This nodes does not have the provideTasks permissions for channel: ${channelName}`)
        }
        // if (!roles.provideTasks) {
        //     throw Error(`This nodes does not have the provideTasks role for channel: ${channelName}`)
        // }
        const pcn = pubsubChannelName(`${channelName}-provideTasks`)
        const msg: UpdateTaskStatusMessageBody = {
            type: 'updateTaskStatus',
            taskId,
            status,
            errorMessage
        }
        this._publishMessageToPubsubChannel(channelName, pcn, msg)
    }
    async registerTaskFunctions(args: {taskFunctions: RegisteredTaskFunction[], backendId: string | null, timeoutMsec: DurationMsec}): Promise<RequestedTask[]> {
        logger.debug(`KacheryHubInterface: registerTaskFunctions`)
        return this.#incomingTaskManager.registerTaskFunctions(args)
    }
    createTaskIdForTask(args: {taskFunctionId: TaskFunctionId, taskKwargs: TaskKwargs, taskFunctionType: TaskFunctionType}) {
        logger.debug(`KacheryHubInterface: createTaskIdForTask`)
        const { taskFunctionId, taskKwargs, taskFunctionType } = args
        if (taskFunctionType === 'pure-calculation') {
            const taskHash = computeTaskHash(taskFunctionId, taskKwargs)
            return toTaskId(taskHash)
        }
        else {
            return toTaskId(randomAlphaString(10))
        }
    }
    async requestTaskFromChannel(args: {channelName: ChannelName, backendId: null | string, taskId: TaskId, taskFunctionId: TaskFunctionId, taskKwargs: TaskKwargs, taskFunctionType: TaskFunctionType, timeoutMsec: DurationMsec, queryUseCache?: boolean, queryFallbackToCache?: boolean}): Promise<RequestTaskResult> {
        logger.debug(`KacheryHubInterface: requestTaskFromChannel`)
        await this.initialize()

        const { channelName, backendId, taskId, taskFunctionId, taskKwargs, taskFunctionType, timeoutMsec, queryUseCache, queryFallbackToCache } = args
        const taskHash = computeTaskHash(taskFunctionId, taskKwargs)
        if (taskFunctionType === 'pure-calculation') {
            if (taskId !== toTaskId(taskHash)) {
                throw Error('Unexpected: taskId does not equal taskHash for pure-calculation')
            }
        }
        if ((taskFunctionType === 'pure-calculation') || ((taskFunctionType === 'query') && ((queryUseCache) || (queryFallbackToCache)))) {
            // const channelBucketUri = await this.getChannelBucketUri(channelName)
            // const channelBucketUrl = urlFromUri(channelBucketUri)
            const bucketBaseUrl = await this.getChannelBucketBaseUrl(channelName)
            if (taskFunctionType === 'pure-calculation') {
                if (taskId.toString() !== taskHash.toString()) throw Error('Task ID for pure function is not equal to task hash')
            }
            const url = urlString(`${bucketBaseUrl}/${channelName}/task_results/${pathifyHash(taskHash)}`)
            const exists = await checkUrlExists(url)
            if (exists) {
                if (taskFunctionType === 'query') {
                    // even though we are using the cached query result, we care still going to request the query... that way the updated result will be available for next time
                    this.#outgoingTaskManager.createOutgoingTask(channelName, taskId)
                    this._requestTaskFromChannel({channelName, backendId, taskFunctionId, kwargs: taskKwargs, taskFunctionType, taskId})
                    
                    if (queryFallbackToCache) {
                        // we'll wait for the query result, but if it times out, we will fall back to the cached result
                        const x0 = await this.waitForTaskResult({channelName, taskId, taskResultUrl: url, timeoutMsec: scaledDurationMsec(3000), taskFunctionType})
                        if (x0.status !== 'waiting') {
                            return {
                                taskId,
                                status: x0.status,
                                taskResultUrl: url,
                                errorMessage: x0.errorMessage,
                                cacheHit: false
                            }
                        }
                    }
                }
                return {
                    taskId,
                    status: 'finished',
                    taskResultUrl: url,
                    cacheHit: true
                }
            }
        }

        let taskResultUrl: UrlString | undefined
        if ((taskFunctionType === 'pure-calculation') || (taskFunctionType === 'query')) {
            // const channelBucketUri = await this.getChannelBucketUri(channelName)
            // const channelBucketUrl = urlFromUri(channelBucketUri)
            const bucketBaseUrl = await this.getChannelBucketBaseUrl(channelName)
            taskResultUrl = urlString(`${bucketBaseUrl}/${channelName}/task_results/${pathifyHash(taskHash)}`)
        }
        else {
            taskResultUrl = undefined
        }

        this.#outgoingTaskManager.createOutgoingTask(channelName, taskId)
        this._requestTaskFromChannel({channelName, backendId, taskFunctionId, kwargs: taskKwargs, taskFunctionType, taskId})
        const x = await this.waitForTaskResult({channelName, taskId, taskResultUrl, timeoutMsec, taskFunctionType})
        return {
            taskId,
            status: x.status,
            taskResultUrl: taskResultUrl,
            errorMessage: x.errorMessage,
            cacheHit: false
        }
    }
    async waitForTaskResult(args: {channelName: ChannelName, taskId: TaskId, taskResultUrl: UrlString | undefined, timeoutMsec: DurationMsec, taskFunctionType: TaskFunctionType}): Promise<WaitForTaskResult> {
        logger.debug(`KacheryHubInterface: waitForTaskResult`)
        const { channelName, taskId, taskResultUrl, timeoutMsec, taskFunctionType } = args

        const t = this.#outgoingTaskManager.outgoingTask(channelName, taskId)
        if (!t) return {
            status: 'error',
            errorMessage: errorMessage('Outgoing task not found')
        }

        return new Promise<WaitForTaskResult>((resolve, reject) => {
            let complete = false
            const { cancelListener } = t.listenForStatusUpdates(() => {
                checkComplete()
            })
            const _return = (result: WaitForTaskResult) => {
                if (complete) return
                complete = true
                cancelListener()
                resolve(result)
            }
            const checkComplete = () => {
                if (complete) return
                if (t.status === 'error') {
                    _return({
                        status: 'error',
                        errorMessage: t.errorMessage
                    })
                }
                else if (t.status === 'finished') {
                    if ((taskFunctionType === 'pure-calculation') || (taskFunctionType === 'query')) {
                        if (taskResultUrl === undefined) throw Error('Unexpected, taskResultUrl is undefined')
                        const url0 = taskFunctionType === 'pure-calculation' ? taskResultUrl : cacheBust(taskResultUrl)
                        checkUrlExists(url0).then(exists => {
                            if (exists) {
                                _return({
                                    status: 'finished'
                                })
                            }
                            else {
                                _return({
                                    status: 'error',
                                    errorMessage: errorMessage('Task finished, but result not found in bucket.')
                                })
                            }
                        }).catch(() => {
                            _return({
                                status: 'error',
                                errorMessage: errorMessage('Task finished, but problem checking whether result exists in bucket.')
                            })
                        })
                    }
                    else if (taskFunctionType === 'action') {
                        _return({
                            status: 'finished'
                        })
                    }
                    else {
                        _return({
                            status: 'error',
                            errorMessage: errorMessage(`Unexpected task function type: ${taskFunctionType}`)
                        })
                    }
                }
            }
            setTimeout(() => {
                checkComplete()
                if (complete) return
                _return({
                    status: t.status
                })
            }, durationMsecToNumber(timeoutMsec))
        })
    }
    _getChannelMembership(channelName: ChannelName) {
        if (!this.#channelMemberships) return
        const x = (this.#channelMemberships || []).filter(cm => (cm.channelName === channelName))[0]
        if (!x) return undefined
        return x
    }
    async _publishMessageToPubsubChannel(channelName: ChannelName, pubsubChannelName: PubsubChannelName, messageBody: KacheryHubPubsubMessageBody) {
        logger.debug(`Publishing message: ${channelName} ${pubsubChannelName} ${messageBody.type}`)
        const pubsubClient = this.#kacheryHubClient.getPubsubClientForChannel(channelName)
        if (pubsubClient) {
            const pubsubChannel = pubsubClient.getChannel(pubsubChannelName)
            const signature = await this.opts.signPubsubMessage(messageBody)
            const m: KacheryHubPubsubMessageData = {
                body: messageBody,
                fromNodeId: this.#kacheryHubClient.nodeId,
                signature
            }
            this.opts.nodeStats.reportMessagesSent(1, channelName)
            pubsubChannel.publish({data: m as any as JSONValue})    
        }
    }
    _handleKacheryHubPubsubMessage(x: IncomingKacheryHubPubsubMessage) {
        const msg = x.message
        if (msg.type === 'requestFile') {
            if (x.pubsubChannelName !== pubsubChannelName(`${x.channelName}-requestFiles`)) {
                logger.warn(`Unexpected pubsub channel for requestFile: ${x.pubsubChannelName}`)
                return
            }
            // const cm = this._getChannelMembership(x.channelName)
            // if (!cm) return
            // const bucketUri = cm.channelBucketUri
            // if (!bucketUri) return
            this.#incomingFileRequestCallbacks.forEach(cb => {
                cb({fileKey: msg.fileKey, channelName: x.channelName, fromNodeId: x.fromNodeId})
            })
        }
        else if (msg.type === 'requestSubfeed') {
            if (x.pubsubChannelName !== pubsubChannelName(`${x.channelName}-requestFeeds`)) {
                logger.warn(`Unexpected pubsub channel for requestSubfeed: ${x.pubsubChannelName}`)
                return
            }
            if (!this.#channelMemberships) return
            const {channelName} = x
            const channelMembership = (this.#channelMemberships || []).filter(cm => (cm.channelName === channelName))[0]
            if (!channelMembership) return
            // roles are deprecated
            // if ((channelMembership.roles.provideFeeds) && (channelMembership.authorization) && (channelMembership.authorization.permissions.provideFeeds)) {
                if ((channelMembership.authorization) && (channelMembership.authorization.permissions.provideFeeds)) {
                this.#requestSubfeedCallbacks.forEach(cb => {
                    cb(channelName, msg.feedId, msg.subfeedHash, msg.position)
                })
            }
        }
        else if (msg.type === 'updateSubfeedMessageCount') {
            if (x.pubsubChannelName !== pubsubChannelName(`${x.channelName}-provideFeeds`)) {
                logger.warn(`Unexpected pubsub channel for updateSubfeedMessageCount: ${x.pubsubChannelName}`)
                return
            }
            this.#updateSubfeedMessageCountCallbacks.forEach(cb => {
                cb(x.channelName, msg.feedId, msg.subfeedHash, msg.messageCount)
            })
        }
        else if (msg.type === 'updateTaskStatus') {
            if (x.pubsubChannelName !== pubsubChannelName(`${x.channelName}-provideTasks`)) {
                logger.warn(`Unexpected pubsub channel for updateTaskStatus: ${x.pubsubChannelName}`)
                return
            }
            this.#outgoingTaskManager.updateTaskStatus({channelName: x.channelName, taskId: msg.taskId, status: msg.status, errMsg: msg.errorMessage})
        }
        else if (msg.type === 'requestTask') {
            if (x.pubsubChannelName !== pubsubChannelName(`${x.channelName}-requestTasks`)) {
                logger.warn(`Unexpected pubsub channel for requestTask: ${x.pubsubChannelName}`)
                return
            }
            this.#incomingTaskManager.requestTask({channelName: x.channelName, taskId: msg.taskId, taskFunctionId: msg.taskFunctionId, taskKwargs: msg.taskKwargs, taskFunctionType: msg.taskFunctionType, backendId: msg.backendId || null})
        }
        else if (msg.type === 'probeTaskFunctions') {
            if (x.pubsubChannelName !== pubsubChannelName(`${x.channelName}-requestTasks`)) {
                logger.warn(`Unexpected pubsub channel for probeTaskFunctions: ${x.pubsubChannelName}`)
                return
            }
            this.#incomingTaskManager.probeTaskFunctions({channelName: x.channelName, backendId: msg.backendId || null, taskFunctionIds: msg.taskFunctionIds}).then((result: ProbeTaskFunctionsResult) => {
                if (result.registeredTaskFunctions.length > 0) {
                    this._publishMessageToPubsubChannel(x.channelName, pubsubChannelName(`${x.channelName}-provideTasks`), {
                        type: 'reportRegisteredTaskFunctions',
                        registeredTaskFunctions: result.registeredTaskFunctions
                    })
                }                
            })
        }
        else if (msg.type === 'reportRegisteredTaskFunctions') {
            if (x.pubsubChannelName !== pubsubChannelName(`${x.channelName}-provideTasks`)) {
                logger.warn(`Unexpected pubsub channel for reportRegisteredTaskFunctions: ${x.pubsubChannelName}`)
                return
            }
            this.#outgoingTaskManager.reportRegisteredTaskFunctions(x.channelName, msg.registeredTaskFunctions)
        }
    }
    async _doInitialize() {
        let nodeConfig: NodeConfig
        try {
            nodeConfig = await this.#kacheryHubClient.fetchNodeConfig()
        }
        catch(err: any) {
            logger.warn('Problem fetching node config.', err.message)
            return
        }
        // initialize the pubsub clients so we can subscribe to the pubsub channels
        for (let cm of (nodeConfig.channelMemberships || [])) {
            const au = cm.authorization
            if (au) {
                const subscribeToPubsubChannels: PubsubChannelName[] = []
                // roles are deprecated
                // if ((au.permissions.requestFiles) && (cm.roles.requestFiles)) {
                if (au.permissions.requestFiles) {
                    // if we are requesting files, then we need to listen to provideFiles channel
                    subscribeToPubsubChannels.push(pubsubChannelName(`${cm.channelName}-provideFiles`))
                }
                // roles are deprecated
                // if ((au.permissions.provideFiles) && (cm.roles.provideFiles)) {
                if (au.permissions.provideFiles) {
                    // if we are providing files, then we need to listen to requestFiles channel
                    subscribeToPubsubChannels.push(pubsubChannelName(`${cm.channelName}-requestFiles`))
                }
                // if ((au.permissions.requestFeeds) && (cm.roles.requestFeeds)) {
                if (au.permissions.requestFeeds) {
                    // if we are requesting feeds, then we need to listen to provideFeeds channel
                    subscribeToPubsubChannels.push(pubsubChannelName(`${cm.channelName}-provideFeeds`))
                }
                // if ((au.permissions.provideFeeds) && (cm.roles.provideFeeds)) {
                if (au.permissions.provideFeeds) {
                    // if we are providing feeds, then we need to listen to requestFeeds channel
                    subscribeToPubsubChannels.push(pubsubChannelName(`${cm.channelName}-requestFeeds`))
                }
                // if ((au.permissions.requestTasks) && (cm.roles.requestTasks)) {
                if (au.permissions.requestTasks) {
                    // if we are requesting tasks, then we need to listen to provideTasks channel
                    subscribeToPubsubChannels.push(pubsubChannelName(`${cm.channelName}-provideTasks`))
                }
                // if ((au.permissions.provideTasks) && (cm.roles.provideTasks)) {
                if (au.permissions.provideTasks) {
                    // if we are providing tasks, then we need to listen to requestTasks channel
                    subscribeToPubsubChannels.push(pubsubChannelName(`${cm.channelName}-requestTasks`))
                }
                // todo: think about how to handle case where authorization has changed, and so we need to subscribe to different pubsub channels
                // for now, the channel is not recreated
                this.#kacheryHubClient.createPubsubClientForChannel(cm.channelName, subscribeToPubsubChannels)
            }
        }
        this.#channelMemberships = [...(nodeConfig.channelMemberships || [])]
        
        for (let channelName of this.opts.additionalChannels) {
            const channelConfig: ChannelConfig = await this.#kacheryHubClient.fetchChannelConfig(channelName)
            const channelMembership: NodeChannelMembership = {
                nodeId: this.opts.nodeId,
                channelName,
                roles: {}, // roles are deprecated
                channelResourceId: channelConfig.bitwooderResourceId,
                channelBucketBaseUrl: channelConfig.bucketBaseUrl
            }
            this.#channelMemberships.push(channelMembership)
        }
    }
}

const getSubfeedPath = (feedId: FeedId, subfeedHash: SubfeedHash) => {
    const f = feedId.toString()
    const s = subfeedHash.toString()
    const subfeedPath = `feeds/${f[0]}${f[1]}/${f[2]}${f[3]}/${f[4]}${f[5]}/${f}/subfeeds/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`
    return subfeedPath
}

type SubfeedJson = {
    messageCount: MessageCount
}
const isSubfeedJson = (x: any): x is SubfeedJson => {
    return _validateObject(x, {
        messageCount: isMessageCount
    }, {allowAdditionalFields: true})
}

const fileKeysMatch = (fileKey1: FileKey, fileKey2: FileKey) => {
    return fileKeyHash(fileKey1) === fileKeyHash(fileKey2)
}

const checkUrlExists = async (url: UrlString) => {
    try {
        const res = await axios.head(url.toString())
        return (res.status === 200)
    }
    catch(err) {
        return false
    }
}

const downloadJson = async (url: UrlString, opts: {cacheBust: boolean}): Promise<JSONValue | null> => {
    if (opts.cacheBust) {
        url = cacheBust(url)
    }
    let resp = null
    try {
        resp = await axios.get(url.toString(), {responseType: 'json'})
    }
    catch(err) {
        return null
    }
    if ((resp) && (resp.data)) {
        return resp.data as any as JSONValue
    }
    else return null
}


// const bucketNameFromUri = (bucketUri: string) => {
//     if (!bucketUri.startsWith('gs://')) throw Error(`Invalid bucket uri: ${bucketUri}`)
//     const a = bucketUri.split('/')
//     return a[2]
// }

export default KacheryHubInterface
