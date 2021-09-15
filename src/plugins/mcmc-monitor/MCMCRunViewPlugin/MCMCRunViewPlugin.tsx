import { FigurlPlugin } from "figurl/types"
import { isNumber, isString, _validateObject } from "commonInterface/kacheryTypes"
import MCMCRunView from "./MCMCRunView"

export type MCMCRunViewData = {
    runUri: string
    runId: string
    runLabel: string
    timestamp: number
}

const isMCMCRunViewData = (x: any) => {
    return _validateObject(x, {
        runUri: isString,
        runId: isString,
        runLabel: isString,
        timestamp: isNumber
    })
}

const MCMCRunViewPlugin: FigurlPlugin = {
    type: 'mcmc-monitor.mcmc-run-view.1',
    validateData: isMCMCRunViewData,
    component: MCMCRunView
}

export default MCMCRunViewPlugin