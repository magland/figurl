import { FeedId, JSONStringifyDeterministic, SubfeedHash } from 'commonInterface/kacheryTypes'
import { useMemo, useRef } from 'react'
import useSubfeed, { parseSubfeedUri } from './useSubfeed'

const useSubfeedReducer = <State, Action>(
    a: {feedId?: FeedId, subfeedHash?: SubfeedHash, subfeedUri?: string},
    reducer: (s: State, a: Action) => State,
    initialState: State,
    opts: {actionField: boolean}
) => {
    let {feedId, subfeedHash, subfeedUri} = a
    if (subfeedUri) {
        // note: this is duplicated code with useSubfeed
        if ((feedId) || (subfeedHash)) {
            throw Error('useSubfeed: Cannot specify both subfeedUri and feedId/subfeedHash')
        }
        const {feedId: fid, subfeedHash: sfh} = parseSubfeedUri(subfeedUri)
        feedId = fid
        subfeedHash = sfh
    }

    const {messages: subfeedMessages, subfeed} = useSubfeed({feedId, subfeedHash})
    const actions: Action[] | undefined = useMemo(() => {
        if (!subfeedMessages) return undefined
        if (opts.actionField) {
            return subfeedMessages.map((m: any) => (m.action as any as Action)).filter((a: any) => (a !== undefined))
        }
        else return subfeedMessages as any as Action[]
    }, [subfeedMessages, opts.actionField])

    const lastComputedState = useRef<{
        numActions: number,
        state: State
    } | undefined>(undefined)

    const initialStateString = JSONStringifyDeterministic(initialState)

    const state = useMemo(() => {
        let s: State
        let ii = 0
        if (lastComputedState.current !== undefined) {
            ii = lastComputedState.current.numActions
            s = lastComputedState.current.state
        }
        else {
            s = JSON.parse(initialStateString)
        }
        while (ii < (actions || [])?.length) {
            s = reducer(s, (actions || [])[ii])
            ii++
        }
        lastComputedState.current = {
            numActions: (actions || []).length,
            state: s
        }
        return s
    }, [actions, initialStateString, reducer])

    return {state, subfeed}
}

// type CompositeState<State> = {
//     feedId: FeedId,
//     subfeedHash: SubfeedHash,
//     initialStateString: string
//     numMessages: number
//     state: State
// }

// const useSubfeedReducerOld = <State, Action>(a: {feedId?: FeedId, subfeedHash?: SubfeedHash, subfeedUri?: string}, reducer: (s: State, a: Action) => State, initialState: State, opts: {actionField: boolean}): {state: State, subfeed: Subfeed | undefined} => {
//     const [compositeState, setCompositeState] = useState<CompositeState<State> | undefined>(undefined)

//     let {feedId, subfeedHash, subfeedUri} = a
//     if (subfeedUri) {
//         // note: this is duplicated code with useSubfeed
//         if ((feedId) || (subfeedHash)) {
//             throw Error('useSubfeed: Cannot specify both subfeedUri and feedId/subfeedHash')
//         }
//         const {feedId: fid, subfeedHash: sfh} = parseSubfeedUri(subfeedUri)
//         feedId = fid
//         subfeedHash = sfh
//     }

//     const {messages: messages2, subfeed} = useSubfeed({feedId, subfeedHash})

//     const messages: SubfeedMessage[] | undefined = useMemo(() => {
//         if (!messages2) return undefined
//         if (opts.actionField) {
//             return messages2.map((m: any) => (m.action)).filter((a: any) => (a !== undefined)) as SubfeedMessage[]
//         }
//         else return messages2
//     }, [messages2, opts.actionField])

//     const initialStateString = JSONStringifyDeterministic(initialState)

//     useEffect(() => {
//         if ((!feedId) || (!subfeedHash) || (!messages)) {
//             if (compositeState) {
//                 setCompositeState(undefined)
//             }
//             return
//         }
//         if ((compositeState) && ((compositeState.feedId !== feedId) || (compositeState.subfeedHash !== subfeedHash) || (compositeState.initialStateString !== initialStateString))) {
//             setCompositeState(undefined)
//             return
//         }
//         if (!compositeState) {
//             setCompositeState({
//                 feedId,
//                 subfeedHash,
//                 initialStateString,
//                 numMessages: messages.length,
//                 state: messages.reduce<State>((previousState, msg) => reducer(previousState, msg as any as Action), JSON.parse(initialStateString))
//             })
//             return
//         }
//         if ((messages) && (messages.length > compositeState.numMessages)) {
//             setCompositeState({
//                 feedId,
//                 subfeedHash,
//                 initialStateString,
//                 numMessages: messages.length,
//                 state: messages.slice(compositeState.numMessages).reduce<State>((previousState, msg) => reducer(previousState, msg as any as Action), compositeState.state)
//             })
//         }
//     }, [feedId, subfeedHash, compositeState, messages, initialStateString, reducer])

//     const state = useMemo(() => {
//         return compositeState ? compositeState.state : JSON.parse(initialStateString)
//     }, [compositeState, initialStateString])

//     return {state, subfeed}
// }

export default useSubfeedReducer