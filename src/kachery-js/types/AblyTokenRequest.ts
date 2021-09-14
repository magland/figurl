import { isNumber, isString, _validateObject } from "./kacheryTypes"

type AblyTokenRequest = {
    capability: string
    clientId?: string
    keyName: string
    mac: string
    nonce: string
    timestamp: number
    ttl?: number
}
export const isAblyTokenRequest = (x: any): x is AblyTokenRequest => {
    return _validateObject(x, {
        capability: isString,
        keyName: isString,
        mac: isString,
        nonce: isString,
        timestamp: isNumber
    }, {allowAdditionalFields: true})
}

export default AblyTokenRequest
