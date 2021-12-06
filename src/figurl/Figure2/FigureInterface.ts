import axios from 'axios'
import GoogleSignInClient from "commonComponents/googleSignIn/GoogleSignInClient"
import { ChannelName, DurationMsec, messageCount, subfeedPosition } from "commonInterface/kacheryTypes"
import { initiateTask } from "figurl/kachery-react"
import deserializeReturnValue from 'figurl/kachery-react/deserializeReturnValue'
import { Task } from "figurl/kachery-react/initiateTask"
import KacheryNode from "kacheryInterface/core/KacheryNode"
import Subfeed from "kacheryInterface/feeds/Subfeed"
import { MutableRefObject } from "react"
import { GetFigureDataResponse, GetFileDataRequest, GetFileDataResponse, InitiateTaskRequest, InitiateTaskResponse, isFigurlRequest, SubscribeToSubfeedRequest, SubscribeToSubfeedResponse } from "./viewInterface/FigurlRequestTypes"
import { MessageToChild, NewSubfeedMessagesMessage, TaskStatusUpdateMessage } from "./viewInterface/MessageToChildTypes"
import { isMessageToParent } from "./viewInterface/MessageToParentTypes"

;(window as any).figurlFileData = {}

class FigureInterface {
    #tasks: {[key: string]: Task<any>} = {}
    #subfeeds: {[key: string]: Subfeed} = {}
    constructor(private a: {
        kacheryNode: KacheryNode,
        channelName: ChannelName,
        backendId: string | null,
        figureId: string,
        viewUrl: string,
        figureData: any,
        iframeElement: MutableRefObject<HTMLIFrameElement | null | undefined>,
        googleSignInClient: GoogleSignInClient
    }) {
        window.addEventListener('message', e => {
            const msg = e.data
            if (isMessageToParent(msg)) {
                if (msg.type === 'figurlRequest') {
                    if (msg.figureId === a.figureId) {
                        const requestId = msg.requestId
                        const request = msg.request
                        if (!isFigurlRequest(request)) return
                        if (request.type === 'getFigureData') {
                            const response: GetFigureDataResponse = {
                                type: 'getFigureData',
                                figureData: a.figureData
                            }
                            this._sendMessageToChild({
                                type: 'figurlResponse',
                                requestId,
                                response
                            })
                        }
                        else if (request.type === 'getFileData') {
                            this.handleGetFileDataRequest(request).then(response => {
                                this._sendMessageToChild({
                                    type: 'figurlResponse',
                                    requestId,
                                    response
                                })
                            })
                        }
                        else if (request.type === 'initiateTask') {
                            this.handleInitiateTaskRequest(request).then(response => {
                                this._sendMessageToChild({
                                    type: 'figurlResponse',
                                    requestId,
                                    response
                                })
                            })
                        }
                        else if (request.type === 'subscribeToSubfeed') {
                            this.handleSubscribeToSubfeedRequest(request).then(response => {
                                this._sendMessageToChild({
                                    type: 'figurlResponse',
                                    requestId,
                                    response
                                })
                            })
                        }
                    }
                }
            }
        })
        const updateSignedIn = () => {
            this._sendMessageToChild({
                type: 'setCurrentUser',
                userId: a.googleSignInClient.userId || undefined,
                googleIdToken: a.googleSignInClient.idToken || undefined
            })
        }
        a.googleSignInClient.onSignedInChanged(() => {
            updateSignedIn()
        })
        updateSignedIn()
    }
    async handleGetFileDataRequest(request: GetFileDataRequest): Promise<GetFileDataResponse> {
        const bucketBaseUrl = await this.a.kacheryNode.kacheryHubInterface().getChannelBucketBaseUrl(this.a.channelName)
        const s = request.sha1.toString()
        const dataUrl = `${bucketBaseUrl}/${this.a.channelName}/sha1/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`
        const x = await axios.get(dataUrl, {responseType: 'json'})
        let data = x.data
        data = await deserializeReturnValue(data)
        ;(window as any).figurlFileData[request.sha1.toString()] = data
        return {
            type: 'getFileData',
            fileData: data
        }
    }
    async handleInitiateTaskRequest(request: InitiateTaskRequest): Promise<InitiateTaskResponse> {
        const task = initiateTask({
            kacheryNode: this.a.kacheryNode,
            channelName: this.a.channelName,
            backendId: this.a.backendId,
            functionId: request.functionId,
            kwargs: request.kwargs,
            functionType: request.functionType,
            queryFallbackToCache: request.queryFallbackToCache,
            queryUseCache: request.queryUseCache,
            onStatusChanged: () => {}
        })
        if (!task) throw Error('Unexpected: undefined task')
        if (!(task.taskId.toString() in this.#tasks)) {
            this.#tasks[task.taskId.toString()] = task
            task.onStatusUpdate(() => {
                const msg: TaskStatusUpdateMessage = {
                    type: 'taskStatusUpdate',
                    taskId: task.taskId,
                    status: task.status,
                    errorMessage: task.errorMessage,
                    returnValue: task.result
                }
                this._sendMessageToChild(msg)
            })
        }
        const response: InitiateTaskResponse = {
            type: 'initiateTask',
            taskId: task.taskId,
            taskStatus: task.status,
            errorMessage: task.errorMessage,
            returnValue: task.result
        }
        return response
    }
    async handleSubscribeToSubfeedRequest(request: SubscribeToSubfeedRequest): Promise<SubscribeToSubfeedResponse> {
        const subfeed = await this.a.kacheryNode.feedManager()._loadSubfeed(request.feedId, request.subfeedHash, this.a.channelName)
        const code = `${request.feedId}:${request.subfeedHash}`
        if (!(code in this.#subfeeds)) {
            this.#subfeeds[code] = subfeed
            subfeed.onMessagesAdded(messages => {
                if (messages.length === 0) return
                const msg: NewSubfeedMessagesMessage = {
                    type: 'newSubfeedMessages',
                    feedId: request.feedId,
                    subfeedHash: request.subfeedHash,
                    position: subfeedPosition(messages[0].body.messageNumber),
                    messages: messages.map(m => (m.body.message))
                }
                this._sendMessageToChild(msg)
            })
            const iterate = async () => {
                while (true) {
                    await subfeed.waitForSignedMessages({position: subfeedPosition(Number(subfeed.getNumLocalMessages())), maxNumMessages: messageCount(100), waitMsec: 10000 as any as DurationMsec})
                }
            }
            iterate()
        }
        const response: SubscribeToSubfeedResponse = {
            type: 'subscribeToSubfeed',
            messages: subfeed.getLocalMessages()
        }
        return response
    }
    _sendMessageToChild(msg: MessageToChild) {
        if (!this.a.iframeElement.current) {
            setTimeout(() => {
                // keep trying until iframe element exists
                this._sendMessageToChild(msg)
            }, 1000)
            return
        }
        const cw = this.a.iframeElement.current.contentWindow
        if (!cw) return
        cw.postMessage(msg, this.a.viewUrl)
    }
}

export default FigureInterface