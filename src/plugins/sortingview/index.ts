import { FigurlPlugin } from "figurl/types"
import AverageWaveformsPlugin from "./AverageWaveformsPlugin/AverageWaveformsPlugin"
import AverageWaveformsNumpyPlugin from "./AverageWaveformsNumpyPlugin/AverageWaveformsNumpyPlugin"
import MountainViewPlugin from "./MountainViewPlugin/MountainViewPlugin"
import WorkspacePlugin from "./WorkspacePlugin/WorkspacePlugin"
import ExperitimeTimeseriesPlugin from "./ExperitimeTimeseriesPlugin/ExperitimeTimeseriesPlugin"

const plugins: FigurlPlugin[] = [
    MountainViewPlugin,
    AverageWaveformsPlugin,
    WorkspacePlugin,
    AverageWaveformsNumpyPlugin,
    ExperitimeTimeseriesPlugin
]

export default plugins