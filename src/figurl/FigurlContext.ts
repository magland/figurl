import React from 'react'

const FigurlContext = React.createContext<{
    backendId: (channel: string) => string | null
    setBackendId: (channel: string, x: string | null) => void
} | undefined>(undefined)

export default FigurlContext