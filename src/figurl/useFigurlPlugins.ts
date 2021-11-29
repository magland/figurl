import { useContext } from "react"
import FigurlContext from "./FigurlContext"

export const useBackendId = () => {
    const context = useContext(FigurlContext)
    return {
        backendIdForChannel: context ? context.backendId : () => (null),
        setBackendIdForChannel: context ? context.setBackendId : () => {}
    }
}
