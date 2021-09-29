import { FigurlPlugin } from "figurl/types"
import builtinPlugins from "./builtin"
import sortingViewPlugins from './sortingview'
import mcmcMonitorPlugins from './mcmc-monitor'
import seriesViewPlugins from './seriesview'

const plugins: FigurlPlugin[] = [
    ...builtinPlugins,
    ...sortingViewPlugins,
    ...mcmcMonitorPlugins,
    ...seriesViewPlugins
]

export default plugins