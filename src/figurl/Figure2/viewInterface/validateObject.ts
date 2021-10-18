export type ValidateObjectSpec = {[key: string]: ValidateObjectSpec | (Function & ((a: any) => any))}

// string
export const isString = (x: any): x is string => {
    return ((x !== null) && (typeof x === 'string'));
}

// function
export const isFunction = (x: any): x is Function => {
    return ((x !== null) && (typeof x === 'function'));
}

// number
export const isNumber = (x: any): x is number => {
    return ((x !== null) && (typeof x === 'number'));
}

// null
export const isNull = (x: any): x is null => {
    return x === null;
}

// boolean
export const isBoolean = (x: any): x is boolean => {
    return ((x !== null) && (typeof x === 'boolean'));
}

// isOneOf
export const isOneOf = (testFunctions: Function[]): ((x: any) => boolean) => {
    return (x) => {
        for (let tf of testFunctions) {
            if (tf(x)) return true;
        }
        return false;
    }
}

export const optional = (testFunctionOrSpec: Function | ValidateObjectSpec): ((x: any) => boolean) => {
    if (isFunction(testFunctionOrSpec)) {
        const testFunction: Function = testFunctionOrSpec
        return (x) => {
            return ((x === undefined) || (testFunction(x)));
        }
    }
    else {
        return (x) => {
            const obj: ValidateObjectSpec = testFunctionOrSpec
            return ((x === undefined) || (validateObject(x, obj)))
        }
    }   
}

// isEqualTo
export const isEqualTo = (value: any): ((x: any) => boolean) => {
    return (x) => {
        return x === value;
    }
}

// isArrayOf
export const isArrayOf = (testFunction: (x: any) => boolean): ((x: any) => boolean) => {
    return (x) => {
        if ((x !== null) && (Array.isArray(x))) {
            for (let a of x) {
                if (!testFunction(a)) return false;
            }
            return true;
        }
        else return false;
    }
}

const validateObject = (x: any, spec: ValidateObjectSpec, opts?: {callback?: (x: string) => any, allowAdditionalFields?: boolean}): boolean => {
    const o = opts || {}
    if (!x) {
        o.callback && o.callback('x is undefined/null.')
        return false;
    }
    if (typeof(x) !== 'object') {
        o.callback && o.callback('x is not an Object.')
        return false;
    }
    for (let k in x) {
        if (!(k in spec)) {
            if (!o.allowAdditionalFields) {
                o.callback && o.callback(`Key not in spec: ${k}`)
                return false;
            }
        }
    }
    for (let k in spec) {
        const specK = spec[k];
        if (isFunction(specK)) {
            if (!specK(x[k])) {
                o.callback && o.callback(`Problem validating: ${k}`)
                return false;
            }
        }
        else {
            if (!(k in x)) {
                o.callback && o.callback(`Key not in x: ${k}`)
                return false;
            }
            if (!validateObject(x[k], specK as ValidateObjectSpec, {callback: o.callback})) {
                o.callback && o.callback(`Value of key > ${k} < itself failed validation.`)
                return false;
            }
        }
    }
    return true;
}

export default validateObject