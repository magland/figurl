import { TaskFunctionId, TaskKwargs } from "commonInterface/kacheryTypes";
import useTask from "./useTask";

const usePureCalculationTask = <ReturnType>(functionId: TaskFunctionId | string | undefined, kwargs: TaskKwargs | {[key: string]: any}, opts: {}) => {
    return useTask<ReturnType>(functionId, kwargs, 'pure-calculation', {})
}

export default usePureCalculationTask