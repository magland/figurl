import { isEqualTo, _validateObject } from "../commonInterface/kacheryTypes"
import { isString } from "vega"

export type LoadGistRequest = {
    type: 'loadGist'
    user: string
    id: string
    file: string
}

export const isLoadGistRequest = (x: any): x is LoadGistRequest => {
    return _validateObject(x, {
        type: isEqualTo('loadGist'),
        user: isString,
        id: isString,
        file: isString
    })
}

export type LoadGistResponse = {
    type: 'loadGist'
    content: string
}

export const isLoadGistResponse = (x: any): x is LoadGistResponse => {
    return _validateObject(x, {
        type: isEqualTo('loadGist'),
        content: isString
    })
}