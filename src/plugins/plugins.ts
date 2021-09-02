import { FigurlPlugin } from "figurl/types"
import builtinPlugins from "./builtin"
import sortingViewPlugins from './sortingview'
import mcmcMonitorPlugins from './mcmc-monitor'
import spikeForestPlugins from './spikeforest'

const plugins: FigurlPlugin[] = [
    ...builtinPlugins,
    ...sortingViewPlugins,
    ...mcmcMonitorPlugins,
    ...spikeForestPlugins
]

export default plugins