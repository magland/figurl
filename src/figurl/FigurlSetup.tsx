import React, { FunctionComponent, useCallback, useState } from 'react';
import FigurlContext from './FigurlContext';
import { FigurlPlugin } from './types';

type Props = {
    plugins: FigurlPlugin[]
}

const getBackendIdObjectFromLocalStorage = (): {[key: string]: string | null} | null => {
    const a = localStorage.getItem('backend-ids') || null
    if (!a) return null
    try {
        const b = JSON.parse(a)
        return b
    }
    catch {
        return null
    }
}

const setBackendIdObjectToLocalStorage = (obj: {[key: string]: string | null}) => {
    localStorage.setItem('backend-ids', JSON.stringify(obj))
}

const FigurlSetup: FunctionComponent<Props> = ({plugins, children}) => {
    const [backendIdObject, setBackendIdObject] = useState<null | {[key: string]: string | null} | undefined>(getBackendIdObjectFromLocalStorage())
    const backendId = useCallback((channel: string): string | null => {
        return (backendIdObject || {})[channel] || null
    }, [backendIdObject])
    const setBackendId = useCallback((channel: string, id: string | null) => {
        const a = backendIdObject || {}
        a[channel] = id
        setBackendIdObject(a)
        setBackendIdObjectToLocalStorage(a)
    }, [backendIdObject])
    return (
        <FigurlContext.Provider value={{plugins, backendId: backendId || null, setBackendId}}>
            {children}
        </FigurlContext.Provider>
    )
}

export default FigurlSetup