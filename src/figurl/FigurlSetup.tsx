import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import FigurlContext from './FigurlContext';

type Props = {
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

const FigurlSetup: FunctionComponent<Props> = ({children}) => {
    const [backendIdObject, setBackendIdObject] = useState<null | {[key: string]: string | null} | undefined>(undefined)
    useEffect(() => {
        setBackendIdObject(getBackendIdObjectFromLocalStorage())
    }, [])
    const backendId = useCallback((channel: string): string | null => {
        return (backendIdObject || {})[channel] || null
    }, [backendIdObject])
    const setBackendId = useCallback((channel: string, id: string | null) => {
        const a = JSON.parse(JSON.stringify(backendIdObject || {}))
        a[channel] = id
        setBackendIdObject(a)
        setBackendIdObjectToLocalStorage(a)
    }, [backendIdObject])
    const value = useMemo(() => ({
        backendId: backendId || null,
        setBackendId
    }), [backendId, setBackendId])
    return (
        <FigurlContext.Provider value={value}>
            {children}
        </FigurlContext.Provider>
    )
}

export default FigurlSetup