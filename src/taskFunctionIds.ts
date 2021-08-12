import { TaskFunctionId } from "kachery-js/types/kacheryTypes"
import taskFunctionIdsFromFile from './python/figurl/backend/tasks/task_function_ids.json'

const taskFunctionIds: TaskFunctionId[] = (taskFunctionIdsFromFile as string[]).map(x => (x as any as TaskFunctionId))

export default taskFunctionIds