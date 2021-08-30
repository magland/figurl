import { ChannelName, DurationMsec, durationMsecToNumber, elapsedSince, FeedId, nowTimestamp, scaledDurationMsec, SubfeedHash, SubfeedPosition, zeroTimestamp } from "../types/kacheryTypes"
import GarbageMap from "../util/GarbageMap"

class OutgoingSubfeedSubscriptionManager {
    #outgoingSubscriptions = new GarbageMap<string, OutgoingSubfeedSubscription>(scaledDurationMsec(300 * 60 * 1000))
    #subscribeToRemoteSubfeedCallbacks: ((feedId: FeedId, subfeedHash: SubfeedHash, channelName: ChannelName, position: SubfeedPosition) => void)[] = []
    async createOrRenewOutgoingSubscription(feedId: FeedId, subfeedHash: SubfeedHash, channelName: ChannelName, position: SubfeedPosition): Promise<void> {
        const subfeedCode = makeSubscriptionCode(feedId, subfeedHash, channelName)
        let S = this.#outgoingSubscriptions.get(subfeedCode)
        if (!S) {
            S = new OutgoingSubfeedSubscription(feedId, subfeedHash)
            this.#outgoingSubscriptions.set(subfeedCode, S)
            S.onSubscribeToRemoteSubfeed((feedId: FeedId, subfeedHash: SubfeedHash, position: SubfeedPosition) => {
                this.#subscribeToRemoteSubfeedCallbacks.forEach(cb => {
                    cb(feedId, subfeedHash, channelName, position)
                })
            })
        }
        await S.renew(position)
        setTimeout(() => {
            this._checkRemove(feedId, subfeedHash, channelName)
        }, durationMsecToNumber(S.durationMsec()) +  durationMsecToNumber(scaledDurationMsec(5000)))
    }
    onSubscribeToRemoteSubfeed(callback: (feedId: FeedId, subfeedHash: SubfeedHash, channelName: ChannelName, position: SubfeedPosition) => void) {
        this.#subscribeToRemoteSubfeedCallbacks.push(callback)
    }
    hasSubfeedSubscription(feedId: FeedId, subfeedHash: SubfeedHash, channelName: ChannelName) {
        const subfeedCode = makeSubscriptionCode(feedId, subfeedHash, channelName)
        return this.#outgoingSubscriptions.has(subfeedCode)
    }
    _checkRemove(feedId: FeedId, subfeedHash: SubfeedHash, channelName: ChannelName) {
        const subfeedCode = makeSubscriptionCode(feedId, subfeedHash, channelName)
        const S = this.#outgoingSubscriptions.get(subfeedCode)
        if (!S) return
        const elapsedMsec = S.elapsedMsecSinceLastRenew()
        if (elapsedMsec > durationMsecToNumber(S.durationMsec())) {
            this.#outgoingSubscriptions.delete(subfeedCode)
        }
    }
}

const makeSubscriptionCode = (feedId: FeedId, subfeedHash: SubfeedHash, channelName: ChannelName) => {
    return feedId.toString() + ':' + subfeedHash.toString() + ':' + channelName.toString()
}

class OutgoingSubfeedSubscription {
    #lastRenewTimestamp = zeroTimestamp()
    #lastRenewDurationMsec: DurationMsec = scaledDurationMsec(1000 * 60)
    #subscribeToRemoteSubfeedCallbacks: ((feedId: FeedId, subfeedHash: SubfeedHash, position: SubfeedPosition) => void)[] = []
    constructor(private feedId: FeedId, private subfeedHash: SubfeedHash) {
    }
    async renew(position: SubfeedPosition): Promise<void> {
        if (elapsedSince(this.#lastRenewTimestamp) < durationMsecToNumber(this.durationMsec()) / 2) {
            return
        }
        this.#lastRenewTimestamp = nowTimestamp()
        this.#subscribeToRemoteSubfeedCallbacks.forEach(cb => {
            cb(this.feedId, this.subfeedHash, position)
        })
    }
    elapsedMsecSinceLastRenew() {
        return elapsedSince(this.#lastRenewTimestamp)
    }
    durationMsec() {
        return this.#lastRenewDurationMsec
    }
    onSubscribeToRemoteSubfeed(callback: (feedId: FeedId, subfeedHash: SubfeedHash, position: SubfeedPosition) => void) {
        this.#subscribeToRemoteSubfeedCallbacks.push(callback)
    }
}

export default OutgoingSubfeedSubscriptionManager