import { isArrayOf, isEqualTo, isNumber, isOneOf, isString, optional, _validateObject } from "../commonInterface/kacheryTypes"

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

export type Figure = {
    figureId?: string
    creationDate?: number
    ownerId: string
    folder: string
    url: string
    channel: string
    dataHash: string
    viewUri: string
    label: string
    description: string
}

export const isFigure = (y: any): y is Figure => {
    return _validateObject(y, {
        figureId: optional(isString),
        creationDate: optional(isNumber),
        ownerId: isString,
        folder: isString,
        url: isString,
        channel: isString,
        dataHash: isString,
        viewUri: isString,
        label: isString,
        description: isString
    })
}

// AddFigure

export type AddFigureRequest = {
    type: 'addFigure'
    figure: Figure,
    auth: Auth
}

export const isAddFigureRequest = (x: any): x is AddFigureRequest => {
    return _validateObject(x, {
        type: isEqualTo('addFigure'),
        figure: isFigure,
        auth: isAuth
    })
}

export type AddFigureResponse = {
    type: 'addFigure'
    figureId: string
}

export const isAddFigureResponse = (x: any): x is AddFigureResponse => {
    return _validateObject(x, {
        type: isEqualTo('addFigure'),
        figureId: isString
    })
}

// GetFigures

export type GetFiguresRequest = {
    type: 'getFigures'
    ownerId: string
}

export const isGetFiguresRequest = (x: any): x is GetFiguresRequest => {
    return _validateObject(x, {
        type: isEqualTo('getFigures'),
        ownerId: isString
    })
}

export type GetFiguresResponse = {
    type: 'getFigures',
    figures: Figure[]
}

export const isGetFiguresResponse = (x: any): x is GetFiguresResponse => {
    return _validateObject(x, {
        type: isEqualTo('getFigures'),
        figures: isArrayOf(isFigure)
    })
}

/////////////////////////////////////////////////////////////////////////////

export type FigureRequest =
    AddFigureRequest |
    GetFiguresRequest

export const isFigureRequest = (x: any): x is FigureRequest => {
    return isOneOf([
        isAddFigureRequest,
        isGetFiguresRequest
    ])(x)
}

export type FigureResponse =
    AddFigureResponse |
    GetFiguresResponse

export const isFigureResponse = (x: any): x is FigureResponse => {
    return isOneOf([
        isAddFigureResponse,
        isGetFiguresResponse
    ])(x)
}