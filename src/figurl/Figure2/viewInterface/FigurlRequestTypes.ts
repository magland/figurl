import validateObject, { isEqualTo, isOneOf } from "./validateObject"

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

//////////////////////////////////////////////////////////////

export type FigurlRequest =
    GetFigureDataRequest

export const isFigurlRequest = (x: any): x is FigurlRequest => {
    return isOneOf([
        isGetFigureDataRequest
    ])(x)
}

export type FigurlResponse =
    GetFigureDataResponse

export const isFigurlResponse = (x: any): x is FigurlResponse => {
    return isOneOf([
        isGetFigureDataResponse
    ])(x)
}