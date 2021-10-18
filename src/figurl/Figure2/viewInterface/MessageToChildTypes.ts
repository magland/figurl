import { FigurlResponse, isFigurlResponse } from "./FigurlRequestTypes";
import validateObject, { isEqualTo, isOneOf, isString } from "./validateObject";

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

export type MessageToChild =
    FigurlResponseMessage

export const isMessageToChild = (x: any): x is MessageToChild => {
    return isOneOf([
        isFigurlResponseMessage
    ])(x)
}