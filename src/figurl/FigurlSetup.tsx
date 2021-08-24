import React, { FunctionComponent, useEffect, useState } from 'react';
import FigurlContext from './FigurlContext';
import { FigurlPlugin } from './types';

type Props = {
    plugins: FigurlPlugin[]
}

const FigurlSetup: FunctionComponent<Props> = ({plugins, children}) => {
    const [backendId, setBackendId] = useState<null | string | undefined>(localStorage.getItem('backend-id') || null)
    useEffect(() => {
        setBackendId(localStorage.getItem('backend-id') || null)
    }, [])
    useEffect(() => {
        if (backendId !== undefined) {
            localStorage.setItem('backend-id', backendId || '')
        }
    }, [backendId])
    return (
        <FigurlContext.Provider value={{plugins, backendId: backendId || null, setBackendId}}>
            {children}
        </FigurlContext.Provider>
    )
}

export default FigurlSetup