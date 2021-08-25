import React from 'react'
import { FigurlPlugin } from './types'

const FigurlContext = React.createContext<{
    plugins: FigurlPlugin[]
    backendId: (channel: string) => string | null
    setBackendId: (channel: string, x: string | null) => void
} | undefined>(undefined)

export default FigurlContext