import { ViewPlugin } from "../../ViewPlugin"
import ClusterComparisonView from "./ClusterComparisonView"

const clusterComparisonPlugin: ViewPlugin = {
    name: 'clusterComparison',
    label: 'Cluster comparison',
    component: ClusterComparisonView,
    singleton: true,
    icon: undefined
}

export default clusterComparisonPlugin