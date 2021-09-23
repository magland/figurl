import { elapsedSince, nowTimestamp, SubfeedPosition, zeroTimestamp } from "../../commonInterface/kacheryTypes";
import Subfeed from "./Subfeed";

class OutgoingSubfeedConnection {
    #initialMessageSent = false
    #lastSendSubscribeToSubfeed = zeroTimestamp()
    #lastReceivedReport = zeroTimestamp()
    constructor(
        private subfeed: Subfeed
    ) {

    }
    reportReceivedUpdateFromRemote() {
        this.#lastReceivedReport = nowTimestamp()
    }
    renew() {
        const channelName = this.subfeed.channelName
        if (channelName === '*local*') {
            return
        }
        let doSendMessage = false
        if (!this.#initialMessageSent) {
            doSendMessage = true
        }
        else {
            const elapsedSinceSend = elapsedSince(this.#lastSendSubscribeToSubfeed)
            const elapsedSinceReceive = elapsedSince(this.#lastReceivedReport)
            if (elapsedSinceSend >= 30 * 1000) {
                if (elapsedSinceReceive < elapsedSinceSend + 10 * 1000) {
                    doSendMessage = true
                }
            }
        }
        if (doSendMessage) {
            this.#initialMessageSent = true
            this.#lastSendSubscribeToSubfeed = nowTimestamp()
            this.subfeed.kacheryHubInterface.sendSubscribeToSubfeedMessage(
                channelName,
                this.subfeed.feedId,
                this.subfeed.subfeedHash,
                this.subfeed.getNumLocalMessages() as any as SubfeedPosition
            )
        }
    }
}

export default OutgoingSubfeedConnection