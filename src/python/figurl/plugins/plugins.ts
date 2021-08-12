import { FigurlPlugin } from "figurl/types"
import VegaLitePlugin from "./altair/ts/VegaLitePlugin"
import BoxLayoutPlugin from "./boxlayout/ts/BoxLayoutPlugin"

const plugins: FigurlPlugin[] = [
    VegaLitePlugin,
    BoxLayoutPlugin
]

export default plugins