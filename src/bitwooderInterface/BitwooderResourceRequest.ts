import AblyTokenRequest, { isAblyTokenRequest } from "./AblyTokenRequest"
import { BitwooderResourceAuth, isBitwooderResourceAuth } from "./BitwooderDelegationCert"
import { isArrayOf, isEqualTo, isJSONValue, isNumber, isOneOf, isString, JSONValue, optional, _validateObject } from "../commonInterface/kacheryTypes"

//////////////////////////////////////////////////////////////////////////////////
// getUploadUrl

export type GetUploadUrlsRequest = {
    type: 'getUploadUrls',
    payload: {
        type: 'getUploadUrls'
        expires: number
        resourceId: string
        filePaths: string[]
        sizes: number[]
    }
    auth: BitwooderResourceAuth
}


export const isGetUploadUrlsRequest = (x: any): x is GetUploadUrlsRequest => {
    const isPayload = (p: any) => {
        return _validateObject(p, {
            type: isEqualTo('getUploadUrl'),
            expires: isNumber,
            resourceId: isString,
            filePaths: isArrayOf(isString),
            sizes: isArrayOf(isNumber)
        })
    }

    return _validateObject(x, {
        type: isEqualTo('getUploadUrl'),
        payload: isPayload,
        auth: isBitwooderResourceAuth
    })
}

export type GetUploadUrlsResponse = {
    type: 'getUploadUrls'
    uploadUrls: string[]
}

export const isGetUploadUrlsResponse = (x: any): x is GetUploadUrlsResponse => {
    return _validateObject(x, {
        type: isEqualTo('getUploadUrls'),
        uploadUrls: isArrayOf(isString)
    })
}

//////////////////////////////////////////////////////////////////////////////////
// getAblyTokenRequest

export type GetAblyTokenRequestRequest = {
    type: 'getAblyTokenRequest'
    payload: {
        type: 'getAblyTokenRequest'
        expires: number
        resourceId: string
        capability: JSONValue
    }
    auth: BitwooderResourceAuth
}


export const isGetAblyTokenRequestRequest = (x: any): x is GetAblyTokenRequestRequest => {
    const isPayload = (p: any) => {
        return _validateObject(p, {
            type: isEqualTo('getAblyTokenRequest'),
            expires: isNumber,
            resourceId: isString,
            capability: isJSONValue
        })
    }

    return _validateObject(x, {
        type: isEqualTo('getAblyTokenRequest'),
        payload: isPayload,
        auth: isBitwooderResourceAuth
    })
}

export type GetAblyTokenRequestResponse = {
    type: 'getAblyTokenRequest'
    ablyTokenRequest: AblyTokenRequest
}

export const isGetAblyTokenRequestResponse = (x: any): x is GetAblyTokenRequestResponse => {
    return _validateObject(x, {
        type: isEqualTo('getAblyTokenRequest'),
        ablyTokenRequest: isAblyTokenRequest
    })
}

//////////////////////////////////////////////////////////////////////////////////
// getResourceInfo

export type GetResourceInfoRequest = {
    type: 'getResourceInfo'
    resourceId?: string
    resourceKey?: string
}


export const isGetResourceInfoRequest = (x: any): x is GetResourceInfoRequest => {
    return _validateObject(x, {
        type: isEqualTo('getResourceInfo'),
        resourceId: optional(isString),
        resourceKey: optional(isString)
    })
}

export type ResourceInfo = {
    resourceId: string
    resourceType: string
    bucketBaseUrl?: string
}

export const isResourceInfo = (x: any): x is ResourceInfo => {
    return _validateObject(x, {
        resourceId: isString,
        resourceType: isString,
        bucketBaseUrl: optional(isString)
    }, {allowAdditionalFields: true})
}

export type GetResourceInfoResponse = {
    type: 'getResourceInfo'
    resourceInfo: ResourceInfo
}

export const isGetResourceInfoResponse = (x: any): x is GetResourceInfoResponse => {
    return _validateObject(x, {
        type: isEqualTo('getResourceInfo'),
        resourceInfo: isResourceInfo
    })
}

//////////////////////////////////////////////////////////////////////////////////

export type BitwooderResourceRequest =
    GetUploadUrlsRequest |
    GetAblyTokenRequestRequest |
    GetResourceInfoRequest

export const isBitwooderResourceRequest = (x: any): x is BitwooderResourceRequest => {
    return isOneOf([
        isGetUploadUrlsRequest,
        isGetAblyTokenRequestRequest,
        isGetResourceInfoRequest
    ])(x)
}

export type BitwooderResourceResponse =
    GetUploadUrlsResponse |
    GetAblyTokenRequestResponse |
    GetResourceInfoResponse

export const isBitwooderResourceResponse = (x: any): x is BitwooderResourceResponse => {
    return isOneOf([
        isGetUploadUrlsResponse,
        isGetAblyTokenRequestResponse,
        isGetResourceInfoResponse
    ])(x)
}