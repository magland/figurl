import { KacheryNode } from "kachery-js"
import { ChannelName } from "kachery-js/types/kacheryTypes"
import { runPureCalculationTaskAsync, useChannel, useFetchCache, useKacheryNode } from "figurl/kachery-react"
import { useMemo } from "react"
import { getArrayMax, getArrayMin } from "../../common/utility"
import sortingviewTaskFunctionIds from "plugins/sortingview/sortingviewTaskFunctionIds"

export type SpikeAmplitudesData = {
    getSpikeAmplitudes: (unitId: number | number[]) => {timepoints: number[], amplitudes: number[], minAmp: number, maxAmp: number} | undefined | null
}

type SpikeAmplitudesDataQuery = {
    type: 'spikeAmplitudes',
    unitId: number | number[]
}

// const calculationPool = createCalculationPool({maxSimultaneous: 6})

const fetchSpikeAmplitudes = async ({kacheryNode, channelName, backendId, recordingObject, sortingObject, unitId, snippetLen}: {kacheryNode: KacheryNode, channelName: ChannelName, backendId: string | null, recordingObject: any, sortingObject: any, unitId: number | number[], snippetLen?: [number, number]}) => {
    // Note that although unit_id can be a list, that is meant to handle the case of a merge group (a few units have been merged together)
    // For proper caching, the intent is to call this task once for every unit (or merge group)
    const result = await runPureCalculationTaskAsync<{
        timepoints: number[]
        amplitudes: number[]
    }>(
        kacheryNode,
        sortingviewTaskFunctionIds.fetchSpikeAmplitudes,
        {
            recording_object: recordingObject,
            sorting_object: sortingObject,
            unit_id: unitId,
            snippet_len: snippetLen
        },
        {
            channelName,
            backendId
        }
    )
    return {
        ...result,
        minAmp: getArrayMin(result.amplitudes),
        maxAmp: getArrayMax(result.amplitudes)
    }
}

const useSpikeAmplitudesData = (recordingObject: any, sortingObject: any, snippetLen?: [number, number]): SpikeAmplitudesData | null => {
    const kacheryNode = useKacheryNode()
    const {channelName, backendId} = useChannel()
    const fetch = useMemo(() => (async (query: SpikeAmplitudesDataQuery) => {
        switch(query.type) {
            case 'spikeAmplitudes': {
                return await fetchSpikeAmplitudes({kacheryNode, channelName, backendId, recordingObject, sortingObject, unitId: query.unitId, snippetLen})
            }
            default: throw Error('Unexpected query type')
        }
    }), [kacheryNode, channelName, backendId, recordingObject, sortingObject, snippetLen])
    const data = useFetchCache<SpikeAmplitudesDataQuery>(fetch)

    const getSpikeAmplitudes = useMemo(() => ((unitId: number | number[]): {timepoints: number[], amplitudes: number[], minAmp: number, maxAmp: number} | undefined => {
        return data.get({type: 'spikeAmplitudes', unitId})
    }), [data])

    return useMemo(() => {
        if ((recordingObject) && (sortingObject)) {
            return {
                getSpikeAmplitudes
            }
        }
        else return null
    }, [getSpikeAmplitudes, recordingObject, sortingObject])
}

export default useSpikeAmplitudesData