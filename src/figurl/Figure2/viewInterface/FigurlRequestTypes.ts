import { ErrorMessage, FeedId, isArrayOf, isErrorMessage, isFeedId, isSha1Hash, isSubfeedHash, isSubfeedMessage, isTaskFunctionId, isTaskFunctionType, isTaskId, isTaskStatus, Sha1Hash, SubfeedHash, SubfeedMessage, TaskFunctionId, TaskFunctionType, TaskId, TaskStatus } from "./kacheryTypes"
import validateObject, { isBoolean, isEqualTo, isOneOf, optional } from "./validateObject"

// getFigureData

export type GetFigureDataRequest = {
    type: 'getFigureData'
}

export const isGetFigureDataRequest = (x: any): x is GetFigureDataRequest => {
    return validateObject(x, {
        type: isEqualTo('getFigureData')
    })
}

export type GetFigureDataResponse = {
    type: 'getFigureData'
    figureData: any
}

export const isGetFigureDataResponse = (x: any): x is GetFigureDataResponse => {
    return validateObject(x, {
        type: isEqualTo('getFigureData'),
        figureData: () => (true)
    })
}

// getFileData

export type GetFileDataRequest = {
    type: 'getFileData'
    sha1: Sha1Hash
}

export const isGetFileDataRequest = (x: any): x is GetFileDataRequest => {
    return validateObject(x, {
        type: isEqualTo('getFileData'),
        sha1: isSha1Hash
    })
}

export type GetFileDataResponse = {
    type: 'getFileData'
    fileData: any
}

export const isGetFileDataResponse = (x: any): x is GetFileDataResponse => {
    return validateObject(x, {
        type: isEqualTo('getFileData'),
        fileData: () => (true)
    })
}

// initiateTask

export type InitiateTaskRequest = {
    type: 'initiateTask'
    functionId: TaskFunctionId
    kwargs: {[key: string]: any}
    functionType: TaskFunctionType
    queryUseCache: boolean
    queryFallbackToCache: boolean
}

export const isInitiateTaskRequest = (x: any): x is InitiateTaskRequest => {
    return validateObject(x, {
        type: isEqualTo('initiateTask'),
        functionId: isTaskFunctionId,
        kwargs: () => (true),
        functionType: isTaskFunctionType,
        queryUseCache: isBoolean,
        queryFallbackToCache: isBoolean
    })
}

export type InitiateTaskResponse = {
    type: 'initiateTask'
    taskId: TaskId
    taskStatus: TaskStatus
    errorMessage?: ErrorMessage // for status=error
    returnValue?: any // for status=finished
}

export const isInitiateTaskResponse = (x: any): x is InitiateTaskResponse => {
    return validateObject(x, {
        type: isEqualTo('initiateTask'),
        taskId: isTaskId,
        taskStatus: isTaskStatus,
        errorMessage: optional(isErrorMessage),
        returnValue: optional(() => (true))
    })
}

// subscribeToSubfeed

export type SubscribeToSubfeedRequest = {
    type: 'subscribeToSubfeed'
    feedId: FeedId
    subfeedHash: SubfeedHash
}

export const isSubscribeToSubfeedRequest = (x: any): x is SubscribeToSubfeedRequest => {
    return validateObject(x, {
        type: isEqualTo('subscribeToSubfeed'),
        feedId: isFeedId,
        subfeedHash: isSubfeedHash
    })
}

export type SubscribeToSubfeedResponse = {
    type: 'subscribeToSubfeed'
    messages: SubfeedMessage[]
}

export const isSubscribeToSubfeedResponse = (x: any): x is SubscribeToSubfeedResponse => {
    return validateObject(x, {
        type: isEqualTo('subscribeToSubfeed'),
        messages: isArrayOf(isSubfeedMessage)
    })
}

//////////////////////////////////////////////////////////////

export type FigurlRequest =
    GetFigureDataRequest |
    GetFileDataRequest |
    InitiateTaskRequest |
    SubscribeToSubfeedRequest

export const isFigurlRequest = (x: any): x is FigurlRequest => {
    return isOneOf([
        isGetFigureDataRequest,
        isGetFileDataRequest,
        isInitiateTaskRequest,
        isSubscribeToSubfeedRequest
    ])(x)
}

export type FigurlResponse =
    GetFigureDataResponse |
    GetFileDataResponse |
    InitiateTaskResponse |
    SubscribeToSubfeedResponse

export const isFigurlResponse = (x: any): x is FigurlResponse => {
    return isOneOf([
        isGetFigureDataResponse,
        isGetFileDataResponse,
        isInitiateTaskResponse,
        isSubscribeToSubfeedResponse
    ])(x)
}