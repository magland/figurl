import { FigurlPlugin } from "figurl/types"
import builtinPlugins from "./builtin"
import sortingViewPlugins from './sortingview'
import mcmcMonitorPlugins from './mcmc-monitor'

const plugins: FigurlPlugin[] = [
    ...builtinPlugins,
    ...sortingViewPlugins,
    ...mcmcMonitorPlugins
]

export default plugins