import { useContext } from "react"
import FigurlContext from "./FigurlContext"

const useFigurlPlugins = () => {
    const context = useContext(FigurlContext)
    if (!context) throw Error('Figurl context is undefined. Use <FigurlSetup>.')
    return context.plugins
}

export const useBackendId = () => {
    const context = useContext(FigurlContext)
    return {
        backendIdForChannel: context ? context.backendId : () => (null),
        setBackendIdForChannel: context ? context.setBackendId : () => {}
    }
}

export default useFigurlPlugins