import { ViewPlugin } from "../../ViewPlugin"
import OverviewClusterView from "./OverviewClusterView"

const overviewClusterPlugin: ViewPlugin = {
    name: 'overviewCluster',
    label: 'Overview cluster',
    component: OverviewClusterView,
    singleton: true,
    icon: undefined
}

export default overviewClusterPlugin