import { FigurlPlugin } from "figurl/types"
import builtinPlugins from "./builtin"
import sortingViewPlugins from './sortingview'

const plugins: FigurlPlugin[] = [
    ...builtinPlugins,
    ...sortingViewPlugins
]

export default plugins