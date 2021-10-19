import { ErrorMessage, FeedId, isErrorMessage, isFeedId, isSubfeedHash, isSubfeedMessage, isSubfeedPosition, isTaskId, isTaskStatus, SubfeedHash, SubfeedMessage, SubfeedPosition, TaskId, TaskStatus } from "commonInterface/kacheryTypes";
import { FigurlResponse, isFigurlResponse } from "./FigurlRequestTypes";
import validateObject, { isArrayOf, isEqualTo, isOneOf, isString, optional } from "./validateObject";

/// figurl Response

export type FigurlResponseMessage = {
    type: 'figurlResponse',
    requestId: string,
    response: FigurlResponse
}

export const isFigurlResponseMessage = (x: any): x is FigurlResponseMessage => {
    return validateObject(x, {
        type: isEqualTo('figurlResponse'),
        requestId: isString,
        response: isFigurlResponse
    })
}

// newSubfeedMessages

export type NewSubfeedMessagesMessage = {
    type: 'newSubfeedMessages',
    feedId: FeedId,
    subfeedHash: SubfeedHash,
    position: SubfeedPosition,
    messages: SubfeedMessage[]
}

export const isNewSubfeedMessagesMessage = (x: any): x is NewSubfeedMessagesMessage => {
    return validateObject(x, {
        type: isEqualTo('newSubfeedMessages'),
        feedId: isFeedId,
        subfeedHash: isSubfeedHash,
        position: isSubfeedPosition,
        messages: isArrayOf(isSubfeedMessage)
    })
}

// taskStatusUpdate

export type TaskStatusUpdateMessage = {
    type: 'taskStatusUpdate',
    taskId: TaskId,
    status: TaskStatus
    errorMessage?: ErrorMessage // for status=error
    returnValue?: any // for status=finished
}

export const isTaskStatusUpdateMessage = (x: any): x is TaskStatusUpdateMessage => {
    return validateObject(x, {
        type: isEqualTo('taskStatusUpdate'),
        taskId: isTaskId,
        status: isTaskStatus,
        errorMessage: optional(isErrorMessage),
        returnValue: optional(() => (true))
    })
}

///////////////////////////////////////////////////////////////////////////////////

export type MessageToChild =
    FigurlResponseMessage |
    NewSubfeedMessagesMessage |
    TaskStatusUpdateMessage

export const isMessageToChild = (x: any): x is MessageToChild => {
    return isOneOf([
        isFigurlResponseMessage,
        isNewSubfeedMessagesMessage,
        isTaskStatusUpdateMessage
    ])(x)
}