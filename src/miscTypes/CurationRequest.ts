import { ChannelName, isArrayOf, isChannelName, isEqualTo, isJSONValue, isNumber, isOneOf, isSha1Hash, isString, JSONValue, optional, Sha1Hash, _validateObject } from "../commonInterface/kacheryTypes"

export type Auth = {
    userId?: string,
    googleIdToken?: string
    reCaptchaToken?: string
}

export const isAuth = (x: any): x is Auth => {
    return _validateObject(x, {
        userId: optional(isString),
        googleIdToken: optional(isString),
        reCaptchaToken: optional(isString)
    })
}

// CreateCuration

export type CreateCurationRequest = {
    type: 'createCuration'
    ownerId: string
    figureObjectHash: Sha1Hash
    figureChannel: ChannelName
    figureLabel: string
    auth: Auth
}

export const isCreateCurationRequest = (x: any): x is CreateCurationRequest => {
    return _validateObject(x, {
        type: isEqualTo('createCuration'),
        ownerId: isString,
        figureObjectHash: isSha1Hash,
        figureChannel: isChannelName,
        figureLabel: isString,
        auth: isAuth
    })
}

export type CreateCurationResponse = {
    type: 'createCuration'
    curationId: string
}

export const isCreateCurationResponse = (x: any): x is CreateCurationResponse => {
    return _validateObject(x, {
        type: isEqualTo('createCuration'),
        curationId: isString
    })
}

// AddCurationMessage

export type AddCurationMessageRequest = {
    type: 'addCurationMessage'
    curationId: string
    messageBody: JSONValue
    auth: Auth
}

export const isAddCurationMessageRequest = (x: any): x is AddCurationMessageRequest => {
    return _validateObject(x, {
        type: isEqualTo('addCurationMessage'),
        curationId: isString,
        messageBody: isJSONValue,
        auth: isAuth
    })
}

export type AddCurationMessageResponse = {
    type: 'addCurationMessage'
}

export const isAddCurationMessageResponse = (x: any): x is AddCurationMessageResponse => {
    return _validateObject(x, {
        type: isEqualTo('addCurationMessage'),
    })
}

// GetCurationMessages

export type GetCurationMessagesRequest = {
    type: 'getCurationMessages'
    curationId: string
    startTimestamp: number
}

export const isGetCurationMessagesRequest = (x: any): x is GetCurationMessagesRequest => {
    return _validateObject(x, {
        type: isEqualTo('getCurationMessages'),
        curationId: isString,
        startTimestamp: isNumber
    })
}

export type GetCurationMessagesResponse = {
    type: 'getCurationMessages',
    messages: {
        timestamp: number
        messageId: string
        messageBody: JSONValue
    }[]
}

export const isGetCurationMessagesResponse = (x: any): x is GetCurationMessagesResponse => {
    const isMessage = (y: any) => {
        return _validateObject(y, {
            timestamp: isNumber,
            messageId: isString,
            messageBody: isJSONValue
        })
    }
    return _validateObject(x, {
        type: isEqualTo('getCurationMessages'),
        messages: isArrayOf(isMessage)
    })
}

// GetCurationInfo

export type GetCurationInfoRequest = {
    type: 'getCurationInfo'
    curationId: string}

export const isGetCurationInfoRequest = (x: any): x is GetCurationInfoRequest => {
    return _validateObject(x, {
        type: isEqualTo('getCurationInfo'),
        curationId: isString
    })
}

export type GetCurationInfoResponse = {
    type: 'getCurationInfo',
    curationId: string,
    ownerId: string,
    figureObjectHash: Sha1Hash,
    figureChannel: ChannelName,
    figureLabel: string
}

export const isGetCurationInfoResponse = (x: any): x is GetCurationInfoResponse => {
    return _validateObject(x, {
        type: isEqualTo('getCurationInfo'),
        curationId: isString,
        ownerId: isString,
        figureObjectHash: isSha1Hash,
        figureChannel: isChannelName,
        figureLabel: isString
    })
}

/////////////////////////////////////////////////////////////////////////////

export type CurationRequest =
    CreateCurationRequest |
    AddCurationMessageRequest |
    GetCurationMessagesRequest |
    GetCurationInfoRequest

export const isCurationRequest = (x: any): x is CurationRequest => {
    return isOneOf([
        isCreateCurationRequest,
        isAddCurationMessageRequest,
        isGetCurationMessagesRequest,
        isGetCurationInfoRequest
    ])(x)
}

export type CurationResponse =
    CreateCurationResponse |
    AddCurationMessageResponse |
    GetCurationMessagesResponse |
    GetCurationInfoResponse

export const isCurationResponse = (x: any): x is CurationResponse => {
    return isOneOf([
        isCreateCurationResponse,
        isAddCurationMessageResponse,
        isGetCurationMessagesResponse,
        isGetCurationInfoResponse
    ])(x)
}