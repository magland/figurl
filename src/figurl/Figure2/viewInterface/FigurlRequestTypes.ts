import { ErrorMessage, FeedId, isArrayOf, isErrorMessage, isFeedId, isSubfeedHash, isSubfeedMessage, isTaskFunctionId, isTaskFunctionType, isTaskId, isTaskStatus, SubfeedHash, SubfeedMessage, TaskFunctionId, TaskFunctionType, TaskId, TaskStatus } from "commonInterface/kacheryTypes"
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
    InitiateTaskRequest |
    SubscribeToSubfeedRequest

export const isFigurlRequest = (x: any): x is FigurlRequest => {
    return isOneOf([
        isGetFigureDataRequest,
        isInitiateTaskRequest,
        isSubscribeToSubfeedRequest
    ])(x)
}

export type FigurlResponse =
    GetFigureDataResponse |
    InitiateTaskResponse |
    SubscribeToSubfeedResponse

export const isFigurlResponse = (x: any): x is FigurlResponse => {
    return isOneOf([
        isGetFigureDataResponse,
        isInitiateTaskResponse,
        isSubscribeToSubfeedResponse
    ])(x)
}