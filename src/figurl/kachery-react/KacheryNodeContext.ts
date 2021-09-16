import React from 'react'
import KacheryNode from 'kacheryInterface/core/KacheryNode'

const KacheryNodeContext = React.createContext<KacheryNode | undefined>(undefined)

export default KacheryNodeContext