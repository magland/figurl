import KacheryNode from "kacheryInterface/core/KacheryNode"
import { ChannelName, TaskFunctionId, TaskKwargs } from "commonInterface/kacheryTypes"
import runTaskAsync from "./runTaskAsync"

const runQueryTaskAsync = async <ReturnType>(kacheryNode: KacheryNode, functionId: TaskFunctionId | string, kwargs: TaskKwargs | { [key: string]: any }, opts: { channelName: ChannelName, backendId: string | null, useCache: boolean }): Promise<ReturnType> => {
  return runTaskAsync<ReturnType>(kacheryNode, functionId, kwargs, 'query', {channelName: opts.channelName, backendId: opts.backendId, queryUseCache: opts.useCache})
}

export default runQueryTaskAsync