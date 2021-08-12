import { FigurlPlugin } from "figurl/types"
import VegaLitePlugin from "./VegaLite/VegaLitePlugin"
import BoxLayoutPlugin from "./BoxLayout/BoxLayoutPlugin"

const plugins: FigurlPlugin[] = [
    VegaLitePlugin,
    BoxLayoutPlugin
]

export default plugins