import { FigurlPlugin } from "figurl/types"
import AverageWaveformsPlugin from "./AverageWaveformsPlugin/AverageWaveformsPlugin"
import ExperitimeTimeseriesPlugin from "./ExperitimeTimeseriesPlugin/ExperitimeTimeseriesPlugin"
import MountainViewPlugin from "./MountainViewPlugin/MountainViewPlugin"
import WorkspacePlugin from "./WorkspacePlugin/WorkspacePlugin"

const plugins: FigurlPlugin[] = [
    MountainViewPlugin,
    AverageWaveformsPlugin,
    WorkspacePlugin,
    ExperitimeTimeseriesPlugin
]

export default plugins