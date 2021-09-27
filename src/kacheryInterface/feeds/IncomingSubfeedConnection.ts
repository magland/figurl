import { ChannelName, elapsedSince, MessageCount, nowTimestamp, SignedSubfeedMessage, subfeedPosition, SubfeedPosition, zeroTimestamp } from "../../commonInterface/kacheryTypes";
import { sleepMsecNum } from "../../commonInterface/util/util";
import Subfeed from "./Subfeed";

class IncomingSubfeedConnection {
    #lastReceivedSubscriptionTimestamp = nowTimestamp()
    #lowestReceivedPosition: SubfeedPosition | undefined = undefined
    #lastSentNewMessagesTimestamp = zeroTimestamp()
    #lastSentNumUploadedMessagesTimestamp = zeroTimestamp()
    #currentNumUploadedMessages: MessageCount | undefined = undefined
    #checkingSend = false
    constructor(private subfeed: Subfeed, private channelName: ChannelName) {
        this._start()
    }
    handleIncomingSubscription(position: SubfeedPosition) {
        if ((this.#lowestReceivedPosition === undefined) || (position < this.#lowestReceivedPosition)) {
            this.#lowestReceivedPosition = position
        }
        this.#lastReceivedSubscriptionTimestamp = nowTimestamp()
        this._checkUpload()
    }
    isExpired() {
        const elapsedSinceReceive = elapsedSince(this.#lastReceivedSubscriptionTimestamp)
        const elapsedSinceSent = Math.min(elapsedSince(this.#lastSentNewMessagesTimestamp), elapsedSince(this.#lastSentNumUploadedMessagesTimestamp))
        if (elapsedSinceReceive > 60 * 1000) {
            // it's been a while since we received a subscription
            if ((elapsedSinceSent > 10 * 1000) && (elapsedSinceSent < elapsedSinceReceive - 10 * 1000)) {
                // but we should have received one if someone is listening
                return true
            }
        }
        return false
    }
    handleNewMessages(messages: SignedSubfeedMessage[]) {
        if (this.isExpired()) return
        this.subfeed.kacheryHubInterface.sendNewSubfeedMessagesMessage(this.channelName, this.subfeed.feedId, this.subfeed.subfeedHash, messages)
    }
    async _checkUpload() {
        if (this.#checkingSend) return
        this.#checkingSend = true
        try {
            await this._doCheckUpload()
        }
        catch(err: any) {
            console.warn(`Error in _checkUpload: ${err.message}`)
        }
        this.#checkingSend = false
    }
    async _doCheckUpload() {
        if (Number(this.#lowestReceivedPosition) < Number(this.subfeed.getNumLocalMessages())) {
            const numUploadedMessages = await this.subfeed.uploadSubfeedMessages(this.channelName)
            this.#lowestReceivedPosition = subfeedPosition(Number(numUploadedMessages))
            this.subfeed.kacheryHubInterface.sendNumSubfeedMessagesUploadedMessage(this.channelName, this.subfeed.feedId, this.subfeed.subfeedHash, numUploadedMessages)
            this.#lastSentNumUploadedMessagesTimestamp = nowTimestamp()
        }
    }
    async _start() {
        while (true) {
            if (this.isExpired()) return
            // important to wait first before checking upload
            await sleepMsecNum(5 * 1000)
            await this._checkUpload()
        }
    }
}

export default IncomingSubfeedConnection