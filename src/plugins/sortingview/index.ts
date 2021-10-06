import { FigurlPlugin } from "figurl/types"
import AverageWaveformsPlugin from "./AverageWaveformsPlugin/AverageWaveformsPlugin"
import AverageWaveformsNumpyPlugin from "./AverageWaveformsNumpyPlugin/AverageWaveformsNumpyPlugin"
import MountainViewPlugin from "./MountainViewPlugin/MountainViewPlugin"
import WorkspacePlugin from "./WorkspacePlugin/WorkspacePlugin"
import SpikeExplorerPlugin from "./SpikeExplorerPlugin/SpikeExplorerPlugin"
import ParcelExplorerPlugin from "./ParcelExplorerPlugin/ParcelExplorerPlugin"

const plugins: FigurlPlugin[] = [
    MountainViewPlugin,
    AverageWaveformsPlugin,
    WorkspacePlugin,
    AverageWaveformsNumpyPlugin,
    SpikeExplorerPlugin,
    ParcelExplorerPlugin
]

export default plugins