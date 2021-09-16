import { TaskFunctionId } from "commonInterface/kacheryTypes"
import taskFunctionIdsFromFile from './task_function_ids.json'

const taskFunctionIds: TaskFunctionId[] = (taskFunctionIdsFromFile as string[]).map(x => (x as any as TaskFunctionId))

export default taskFunctionIds