import { FigurlPlugin } from "figurl/types"
import VegaLitePlugin from "./VegaLite/VegaLitePlugin"
import BoxLayoutPlugin from "./BoxLayout/BoxLayoutPlugin"
import MarkdownPlugin from "./Markdown/MarkdownPlugin"

const plugins: FigurlPlugin[] = [
    VegaLitePlugin,
    BoxLayoutPlugin,
    MarkdownPlugin
]

export default plugins