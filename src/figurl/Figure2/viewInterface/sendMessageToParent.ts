import { MessageToParent } from "./MessageToParentTypes";

const urlSearchParams = new URLSearchParams(window.location.search)
const queryParams = Object.fromEntries(urlSearchParams.entries())

const sendMessageToParent = (x: MessageToParent) => {
    ;(window.top as any).postMessage(x, queryParams.parentOrigin)
}

export default sendMessageToParent