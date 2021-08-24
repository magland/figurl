import React from 'react'
import { FigurlPlugin } from './types'

const FigurlContext = React.createContext<{
    plugins: FigurlPlugin[]
    backendId: string | null
    setBackendId: (x: string | null) => void
} | undefined>(undefined)

export default FigurlContext