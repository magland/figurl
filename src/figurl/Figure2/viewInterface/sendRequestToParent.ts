import { FigurlRequest, FigurlResponse } from "./FigurlRequestTypes";
import { isMessageToChild } from "./MessageToChildTypes";
import { FigurlRequestMessage } from "./MessageToParentTypes";
import sendMessageToParent from "./sendMessageToParent";

const urlSearchParams = new URLSearchParams(window.location.search)
const queryParams = Object.fromEntries(urlSearchParams.entries())

const pendingRequests: {[key: string]: {
    onResponse: (response: FigurlResponse) => void
    onError: (err: any) => void
}} = {}

window.addEventListener('message', e => {
    const msgData = e.data
    let msg
    try {
        msg = JSON.parse(msgData)
    }
    catch(err) {
        return
    }
    if (isMessageToChild(msg)) {
        if (msg.type === 'figurlResponse') {
            const requestId = msg.requestId
            const response = msg.response
            if (requestId in pendingRequests) {
                pendingRequests[requestId].onResponse(response)
                delete pendingRequests[requestId]
            }
        }
    }
})

const sendRequestToParent = async (request: FigurlRequest) => {
    return new Promise((resolve, reject) => {
        const requestId = randomAlphaString(10)
        pendingRequests[requestId] = {
            onResponse: (response: FigurlResponse) => {
                resolve(response)
            },
            onError: (err: any) => {
                reject(err)
            }
        }
        const msg: FigurlRequestMessage = {
            type: 'figurlRequest',
            figureId: queryParams.figureId,
            requestId,
            request
        }
        sendMessageToParent(msg)
    })
}

const randomAlphaString = (num_chars: number) => {
    if (!num_chars) {
        /* istanbul ignore next */
        throw Error('randomAlphaString: num_chars needs to be a positive integer.')
    }
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

export default sendRequestToParent