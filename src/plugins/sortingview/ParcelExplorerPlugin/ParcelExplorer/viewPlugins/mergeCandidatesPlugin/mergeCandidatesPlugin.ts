import { ViewPlugin } from "../../ViewPlugin"
import MergeCandidatesView from "./MergeCandidatesView"

const mergeCandidatesPlugin: ViewPlugin = {
    name: 'mergeCandidates',
    label: 'Merge candidates',
    component: MergeCandidatesView,
    singleton: true,
    icon: undefined
}

export default mergeCandidatesPlugin