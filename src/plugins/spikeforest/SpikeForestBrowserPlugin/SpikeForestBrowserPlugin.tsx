import { FigurlPlugin } from "figurl/types"
import { isString, _validateObject } from "kachery-js/types/kacheryTypes"
import SpikeForestBrowser from "./SpikeForestBrowser"

// example URI: sha1://52f24579bb2af1557ce360ed5ccc68e480928285/file.txt?manifest=5bfb2b44045ac3e9bd2a8fe54ef67aa932844f58
export type SpikeForestBrowserData = {
    uri: string
}

const isSpikeForestBrowserData = (x: any) => {
    return _validateObject(x, {
        uri: isString
    })
}

const SpikeForestBrowserPlugin: FigurlPlugin = {
    type: 'spikeforest.browser.1',
    validateData: isSpikeForestBrowserData,
    component: SpikeForestBrowser
}

export default SpikeForestBrowserPlugin