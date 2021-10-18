import { FigurlRequest, isFigurlRequest } from "./FigurlRequestTypes";
import validateObject, { isEqualTo, isOneOf, isString } from "./validateObject";

export type FigurlRequestMessage = {
    type: 'figurlRequest',
    figureId: string,
    requestId: string,
    request: FigurlRequest
}

export const isFigurlRequestMessage = (x: any): x is FigurlRequestMessage => {
    return validateObject(x, {
        type: isEqualTo('figurlRequest'),
        figureId: isString,
        requestId: isString,
        request: isFigurlRequest
    })
}

export type MessageToParent =
    FigurlRequestMessage

export const isMessageToParent = (x: any): x is MessageToParent => {
    return isOneOf([
        isFigurlRequestMessage
    ])(x)
}