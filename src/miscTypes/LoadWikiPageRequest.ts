import { isEqualTo, isString, _validateObject } from "../commonInterface/kacheryTypes"

export type LoadWikiPageRequest = {
    type: 'loadWikiPage'
    user: string
    repo: string
    page: string
}

export const isLoadWikiPageRequest = (x: any): x is LoadWikiPageRequest => {
    return _validateObject(x, {
        type: isEqualTo('loadWikiPage'),
        user: isString,
        repo: isString,
        page: isString
    })
}

export type LoadWikiPageResponse = {
    type: 'loadWikiPage'
    content: string
}

export const isLoadWikiPageResponse = (x: any): x is LoadWikiPageResponse => {
    return _validateObject(x, {
        type: isEqualTo('loadWikiPage'),
        content: isString
    })
}