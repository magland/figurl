import { Mutex } from 'async-mutex';
import axios from 'axios';
import logger from 'winston';
import { hexToPublicKey, signMessage, verifySignature } from '../../commonInterface/crypto/signatures';
import { byteCount, ChannelName, DurationMsec, durationMsecToNumber, FeedId, feedIdToPublicKeyHex, JSONObject, messageCount, MessageCount, messageCountToNumber, nowTimestamp, PrivateKey, PublicKey, SignedSubfeedMessage, SubfeedHash, SubfeedMessage, subfeedPosition, SubfeedPosition, subfeedPositionToNumber } from '../../commonInterface/kacheryTypes';
import randomAlphaString from '../../commonInterface/util/randomAlphaString';
import { LocalFeedManagerInterface } from '../core/ExternalInterface';
import KacheryHubInterface from '../core/KacheryHubInterface';
import NodeStats from '../core/NodeStats';
import IncomingSubfeedConnection from './IncomingSubfeedConnection';
import LocalSubfeedSignedMessagesManager from './LocalSubfeedSignedMessagesManager';
import OutgoingSubfeedConnection from './OutgoingSubfeedConnection';
import RemoteSubfeedMessageDownloader from './RemoteSubfeedMessageDownloader';

class Subfeed {
    // Represents a subfeed, which may or may not be writeable on this node
    #publicKey: PublicKey // The public key of the feed (which is determined by the feed ID)
    #privateKey: PrivateKey | null = null // The private key (or null if this is not writeable on the local node) -- set below
    #localSubfeedSignedMessagesManager: LocalSubfeedSignedMessagesManager // The signed messages loaded from the messages file (in-memory cache)
    #isWriteable: boolean | null = null
    
    #initialized: boolean = false;
    #initializing: boolean = false;
    
    #onInitializedCallbacks: (() => void)[] = [];
    #onInitializeErrorCallbacks: ((err: Error) => void)[] = [];
    #newMessageListeners = new Map<ListenerId, () => void>();

    #onMessagesAddedCallbacks: ((messages: SignedSubfeedMessage[]) => void)[] = []

    #mutex = new Mutex()
    #remoteSubfeedMessageDownloader: RemoteSubfeedMessageDownloader

    #outgoingSubfeedConnection: OutgoingSubfeedConnection
    #incomingSubfeedConnectionsByChannel: {[channelName: string]: IncomingSubfeedConnection} = {}

    constructor(public kacheryHubInterface: KacheryHubInterface, public feedId: FeedId, public subfeedHash: SubfeedHash, public channelName: ChannelName | '*local*', private localFeedManager: LocalFeedManagerInterface, private nodeStats: NodeStats) {
        this.#publicKey = hexToPublicKey(feedIdToPublicKeyHex(feedId)); // The public key of the feed (which is determined by the feed ID)
        this.#localSubfeedSignedMessagesManager = new LocalSubfeedSignedMessagesManager(localFeedManager, feedId, subfeedHash, this.#publicKey)
        this.#remoteSubfeedMessageDownloader = new RemoteSubfeedMessageDownloader(this.kacheryHubInterface, this)

        this.#outgoingSubfeedConnection = new OutgoingSubfeedConnection(
            this
        )
    }
    async acquireLock() {
        return await this.#mutex.acquire()
    }
    async initialize(privateKey: PrivateKey | null) {
        this.#privateKey = privateKey
        if (this.#initialized) return
        if (this.#initializing) {
            await this.waitUntilInitialized()
            return
        }
        try {
            this.#initializing = true
            this.#isWriteable = await this.localFeedManager.hasWriteableFeed(this.feedId)
            // Check whether we have the feed locally (may or may not be locally writeable)
            const existsLocally = await this.localFeedManager.subfeedExistsLocally(this.feedId, this.subfeedHash)
            if (existsLocally) {
                await this.#localSubfeedSignedMessagesManager.initializeFromLocal()
            }
            else {
                // Otherwise, we don't have it locally -- so let's just initialize things
                this.#localSubfeedSignedMessagesManager.initializeEmptyMessageList()
                // const messages = await this.localFeedManager.getSignedSubfeedMessages(this.feedId, this.subfeedHash)
                // if (messages.length !== 0) throw Error('Unexpected, messages.length is not zero')

                // don't do this
                // // Let's try to load messages from remote nodes on the network
                // if (!opts.localOnly) {
                //     await this.getSignedMessages({position: subfeedPosition(0), maxNumMessages: messageCount(10), waitMsec: scaledDurationMsec(1)})
                // }
            }
        }
        catch(err: any) {
            this.#onInitializeErrorCallbacks.forEach(cb => {cb(err)})
            throw err
        }

        if (this.channelName !== '*local*') {
            const numM = await this.kacheryHubInterface.checkForSubfeedInChannelBucket(this.feedId, this.subfeedHash, this.channelName)
            if (numM !== null) {
                const start0 = this.#localSubfeedSignedMessagesManager.getNumMessages()
                if (numM > start0) {
                    let msgs: SignedSubfeedMessage[] | undefined = undefined
                    try {
                        msgs = await this.kacheryHubInterface.downloadSignedSubfeedMessages(this.channelName, this.feedId, this.subfeedHash, start0, numM)
                    }
                    catch(err: any) {
                        console.warn(`Problem loading signed subfeed messages from channel ${this.channelName} ${this.feedId} ${this.subfeedHash} ${start0} ${numM}: ${err.message}`)
                    }
                    if (msgs) {
                        this.#localSubfeedSignedMessagesManager.addSignedMessages(msgs)
                        this._callNewMessagesCallbacks(msgs)
                    }
                }
            }
        }

        this.#initializing = false
        this.#initialized = true

        this.#onInitializedCallbacks.forEach(cb => {cb()})
    }
    async waitUntilInitialized(): Promise<void> {
        if (this.#initialized) return
        return new Promise<void>((resolve, reject) => {
            this.#onInitializeErrorCallbacks.push((err: Error) => {
                reject(err)
            })
            this.#onInitializedCallbacks.push(() => {
                resolve()
            })
        });
    }
    getFeedId() {
        return this.feedId
    }
    getSubfeedHash() {
        return this.subfeedHash
    }
    getLocalMessages(): SubfeedMessage[] {
        return this.#localSubfeedSignedMessagesManager.getMessages()
    }
    getNumLocalMessages(): MessageCount {
        // Return the number of messages that are currently loaded into memory
        return this.#localSubfeedSignedMessagesManager.getNumMessages()
    }
    isWriteable(): boolean {
        // Whether this subfeed is writeable. That depends on whether we have a private key
        if (this.#isWriteable === null) {
            /* istanbul ignore next */
            throw Error('#isWriteable is null. Perhaps isWriteable was called before subfeed was initialized.');
        }
        return this.#isWriteable
    }
    async waitForSignedMessages({position, maxNumMessages, waitMsec}: {position: SubfeedPosition, maxNumMessages: MessageCount, waitMsec: DurationMsec}): Promise<SignedSubfeedMessage[]> {
        const check = () => {
            if (subfeedPositionToNumber(position) < messageCountToNumber(this.getNumLocalMessages())) {
                let numMessages = messageCount(messageCountToNumber(this.getNumLocalMessages()) - subfeedPositionToNumber(position))
                if (messageCountToNumber(maxNumMessages) > 0) {
                    numMessages = messageCount(Math.min(messageCountToNumber(maxNumMessages), messageCountToNumber(numMessages)))
                }
                return this.getLocalSignedMessages({position, numMessages})
            }
            else return []
        }
        const messages = check()
        if (messages.length > 0) return messages
        if (durationMsecToNumber(waitMsec) > 0) {
            this.#outgoingSubfeedConnection.renew()
            return new Promise((resolve, reject) => {
                const listenerId = createListenerId()
                let completed = false
                this.#newMessageListeners.set(listenerId, () => {
                    if (completed) return
                    const msgs = check()
                    if (msgs.length > 0) {
                        completed = true
                        this.#newMessageListeners.delete(listenerId)
                        resolve(msgs)    
                    }
                })
                setTimeout(() => {
                    if (completed) return
                    completed = true
                    this.#newMessageListeners.delete(listenerId)
                    resolve([])
                }, durationMsecToNumber(waitMsec));
            })
        }
        else {
            return []
        }
    }
    getLocalSignedMessages({position, numMessages}: {position: SubfeedPosition, numMessages: MessageCount}): SignedSubfeedMessage[] {
        // Get some signed messages starting at position
        if (!this.#localSubfeedSignedMessagesManager.isInitialized()) {
            /* istanbul ignore next */
            throw Error('signed messages not initialized. Perhaps getLocalSignedMessages was called before subfeed was initialized.');
        }
        if (subfeedPositionToNumber(position) + messageCountToNumber(numMessages) <= Number(this.#localSubfeedSignedMessagesManager.getNumMessages())) {
            // If we have some messages loaded into memory, let's return those!
            let signedMessages: SignedSubfeedMessage[] = [];
            for (let i = subfeedPositionToNumber(position); i < subfeedPositionToNumber(position) + messageCountToNumber(numMessages); i++) {
                signedMessages.push(this.#localSubfeedSignedMessagesManager.getSignedMessage(i));
            }
            return signedMessages
        }
        else {
            throw Error(`Cannot get local signed messages (position=${position}, numMessages=${numMessages}, getNumMessages=${this.#localSubfeedSignedMessagesManager.getNumMessages()})`)
        }
    }
    async appendMessages(messages: SubfeedMessage[], {metaData} : {metaData: Object | undefined}) {
        if (!this.#localSubfeedSignedMessagesManager.isInitialized()) {
            /* istanbul ignore next */
            throw Error('signed messages not initialized. Perhaps appendMessages was called before subfeed was initialized.')
        }
        if (messages.length === 0) return
        if (!this.#privateKey) {
            /* istanbul ignore next */
            throw Error(`Cannot write to feed without private key: ${this.#privateKey}`)
        }
        const signedMessagesToAppend: SignedSubfeedMessage[] = []
        let previousSignature;
        if (Number(this.#localSubfeedSignedMessagesManager.getNumMessages()) > 0) {
            previousSignature = this.#localSubfeedSignedMessagesManager.getSignedMessage(Number(this.#localSubfeedSignedMessagesManager.getNumMessages()) - 1).signature;
        }
        let messageNumber = Number(this.#localSubfeedSignedMessagesManager.getNumMessages());
        for (let msg of messages) {
            let body = {
                message: msg,
                previousSignature,
                messageNumber,
                timestamp: nowTimestamp(),
                metaData: metaData ? metaData : undefined
            }
            const signedMessage: SignedSubfeedMessage = {
                body,
                signature: await signMessage(body as any as JSONObject, {publicKey: this.#publicKey, privateKey: this.#privateKey})
            }
            if (!await verifySignature(body as any as JSONObject, this.#publicKey, await signMessage(body as any as JSONObject, {publicKey: this.#publicKey, privateKey: this.#privateKey}))) {
                throw Error('Error verifying signature')
            }
            signedMessagesToAppend.push(signedMessage)
            previousSignature = signedMessage.signature
            messageNumber ++;
        }
        // CHAIN:append_messages:step(4)
        await this.addSignedMessages(signedMessagesToAppend)
    }
    async addSignedMessages(signedMessages: SignedSubfeedMessage[]) {
        if (!this.#localSubfeedSignedMessagesManager.isInitialized()) {
            /* istanbul ignore next */
            throw Error('signed messages not initialized. Perhaps addSignedMessages was called before subfeed was initialized.');
        }
        if (signedMessages.length === 0)
            return;
        // it's possible that we have already added some of these messages. Let's check
        if (signedMessages[0].body.messageNumber < messageCountToNumber(this.#localSubfeedSignedMessagesManager.getNumMessages())) {
            signedMessages = signedMessages.slice(messageCountToNumber(this.#localSubfeedSignedMessagesManager.getNumMessages()) - signedMessages[0].body.messageNumber)
        }
        if (signedMessages.length === 0)
            return;
        const signedMessagesToAdd: SignedSubfeedMessage[] = []
        let previousSignature;
        if (Number(this.#localSubfeedSignedMessagesManager.getNumMessages()) > 0) {
            previousSignature = this.#localSubfeedSignedMessagesManager.getSignedMessage(Number(this.#localSubfeedSignedMessagesManager.getNumMessages()) - 1).signature;
        }
        let messageNumber = Number(this.#localSubfeedSignedMessagesManager.getNumMessages());
        for (let signedMessage of signedMessages) {
            const body = signedMessage.body;
            const signature = signedMessage.signature;
            if (!await verifySignature(body as any as JSONObject, this.#publicKey, signature)) {
                throw Error(`Error verifying signature when adding signed message for: ${this.feedId} ${this.subfeedHash} ${signature}`);
            }
            if ((body.previousSignature || null) !== (previousSignature || null)) {
                throw Error(`Error in previousSignature when adding signed message for: ${this.feedId} ${this.subfeedHash} ${body.previousSignature} <> ${previousSignature}`);
            }
            if (body.messageNumber !== messageNumber) {
                // problem here
                throw Error(`Error in messageNumber when adding signed message for: ${this.feedId} ${this.subfeedHash} ${body.messageNumber} <> ${messageNumber}`);
            }
            previousSignature = signedMessage.signature;
            messageNumber ++;
            signedMessagesToAdd.push(signedMessage)
        }
        // CHAIN:append_messages:step(5)
        await this.#localSubfeedSignedMessagesManager.addSignedMessages(signedMessagesToAdd);
        this._callNewMessagesCallbacks(signedMessagesToAdd)
    }
    async downloadMessages(numUploadedMessages: MessageCount) {
        const i1 = this.getNumLocalMessages()
        const i2 = numUploadedMessages
        const channelName = this.channelName
        if (channelName === '*local*') return
        if (i1 >= i2) return
        const messages = await this.kacheryHubInterface.downloadSignedSubfeedMessages(channelName, this.feedId, this.subfeedHash, i1, i2)
        this.addSignedMessages(messages)
    }
    handleIncomingSubscription(channelName: ChannelName, position: SubfeedPosition) {
        let a = this.#incomingSubfeedConnectionsByChannel[channelName.toString()]
        if ((!a) || (a.isExpired())) {
            a = new IncomingSubfeedConnection(this, channelName)
            this.#incomingSubfeedConnectionsByChannel[channelName.toString()] = a
        }
        a.handleIncomingSubscription(position)
    }
    reportReceivedUpdateFromRemote() {
        this.#outgoingSubfeedConnection.reportReceivedUpdateFromRemote()
    }
    _callNewMessagesCallbacks(messages: SignedSubfeedMessage[]) {
        if (messages.length === 0) return
        for (let listener of this.#newMessageListeners.values()) {
            listener()
        }
        for (let cb of this.#onMessagesAddedCallbacks) {
            cb(messages)
        }
        const channelNames = Object.keys(this.#incomingSubfeedConnectionsByChannel).map(cn => (cn as any as ChannelName))
        for (let channelName of channelNames) {
            const x = this.#incomingSubfeedConnectionsByChannel[channelName.toString()]
            if (!x.isExpired()) {
                x.handleNewMessages(messages)
            }
            else {
                delete this.#incomingSubfeedConnectionsByChannel[channelName.toString()]
            }
        }
    }
    async uploadSubfeedMessages(channelName: ChannelName): Promise<MessageCount> {
        const subfeedJson = await this.kacheryHubInterface.loadSubfeedJson(channelName, this.feedId, this.subfeedHash)
        const currentNumUploaded = subfeedJson ? subfeedJson.messageCount : messageCount(0)
        const numLocal = this.getNumLocalMessages()
        if (currentNumUploaded < numLocal) {
            const i1 = Number(currentNumUploaded)
            const i2 = Number(numLocal)
            logger.debug(`uploadSubfeedMessagesToChannel: Uploading subfeed messages ${i1}-${i2 - 1} to channel ${channelName}`)
            const signedMessages = this.getLocalSignedMessages({position: subfeedPosition(i1), numMessages: messageCount(i2 - i1)})
            const signedMessageContents = signedMessages.map((sm) => (
                new TextEncoder().encode(JSON.stringify(sm))
            ))
            const messageSizes = signedMessageContents.map((smc) => byteCount(smc.length))
            const uploadUrls = await this.kacheryHubInterface.createSignedSubfeedMessageUploadUrls({channelName, feedId: this.feedId, subfeedHash: this.subfeedHash, messageNumberRange: [i1, i2], messageSizes})
            for (let i = i1; i < i2; i++) {
                const uploadUrl = uploadUrls[i - i1]
                const signedMessageContent = signedMessageContents[i - i1]
                const resp = await axios.put(uploadUrl.toString(), signedMessageContent, {
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Content-Length': signedMessageContent.length
                    },
                    maxBodyLength: Infinity, // apparently this is important
                    maxContentLength: Infinity // apparently this is important
                })
                if (resp.status !== 200) {
                    throw Error(`Error in upload of subfeed message: ${resp.statusText}`)
                }
                this.nodeStats.reportBytesSent(byteCount(signedMessageContent.length), channelName)
            }
        }
        return numLocal
    }
    onMessagesAdded(callback: (messages: SignedSubfeedMessage[]) => void) {
        this.#onMessagesAddedCallbacks.push(callback)
    }
    reportNumRemoteMessages(channelName: ChannelName, numRemoteMessages: MessageCount) {
        this.#remoteSubfeedMessageDownloader.reportNumRemoteMessages(channelName, numRemoteMessages)
    }
}

interface ListenerId extends String {
    __listenerId__: never; // phantom
}
const createListenerId = (): ListenerId => {
    return randomAlphaString(10) as any as ListenerId;
}

export default Subfeed
