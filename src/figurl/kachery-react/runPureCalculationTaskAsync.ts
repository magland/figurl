import KacheryNode from "kacheryInterface/core/KacheryNode"
import { ChannelName, TaskFunctionId, TaskKwargs } from "commonInterface/kacheryTypes"
import runTaskAsync from "./runTaskAsync"

const runPureCalculationTaskAsync = async <ReturnType>(kacheryNode: KacheryNode, functionId: TaskFunctionId | string, kwargs: TaskKwargs | { [key: string]: any }, opts: { channelName: ChannelName, backendId: string | null }): Promise<ReturnType> => {
  return runTaskAsync<ReturnType>(kacheryNode, functionId, kwargs, 'pure-calculation', opts)
}

export default runPureCalculationTaskAsync