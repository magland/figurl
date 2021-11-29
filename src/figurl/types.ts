import { isString, _validateObject } from "commonInterface/kacheryTypes";


// A figure object comprises the figure type and the figure data to be sent to the figure component
export type FigureObject = {
    type: string
    data: any
}

export const isFigureObject = (x: any): x is FigureObject => {
    return _validateObject(x, {
        type: isString,
        data: () => (true)
    }, {allowAdditionalFields: true})
}