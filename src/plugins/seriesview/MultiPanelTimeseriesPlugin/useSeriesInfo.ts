import { useChannel, usePureCalculationTask } from "figurl/kachery-react";
import { useMemo } from "react";
import sortingviewTaskFunctionIds from "../seriesviewTaskFunctionIds";
import { SeriesInfo, SeriesManifest } from "./interface/SeriesInfo";

const useSeriesInfo = (seriesUri: string) => {
    const {channelName} = useChannel()
    const {returnValue: manifest, task} = usePureCalculationTask<SeriesManifest>(
        seriesUri ? sortingviewTaskFunctionIds.seriesViewGetSeriesManifest : undefined,
        {series_uri: seriesUri},
        {channelName}
    )
    const seriesInfo: SeriesInfo | undefined = useMemo(() => {
        if (!manifest) return undefined
        const {numSamples, startTime, endTime, minValue, maxValue } = scanManifest(manifest)
        return {
            uri: seriesUri,
            manifest,
            numSamples,
            startTime,
            endTime,
            minValue,
            maxValue,
            type: manifest.type,
            samplingFrequency: manifest.sampling_frequency
        }
    }, [manifest, seriesUri])
    return {seriesInfo, task}
}

const scanManifest = (manifest: SeriesManifest) => {
    const startTime = manifest.segments[0].start_time
    const endTime = manifest.segments[manifest.segments.length - 1].end_time
    let numSamples = 0
    let minValue: number | undefined = undefined
    let maxValue: number | undefined = undefined
    for (let s of manifest.segments) {
        numSamples += s.num_samples
        if ((minValue === undefined) || (s.min_value < minValue)) minValue = s.min_value
        if ((maxValue === undefined) || (s.max_value > maxValue)) maxValue = s.max_value
    }
    if (minValue === undefined) throw Error('Number of segments must be zero')
    if (maxValue === undefined) throw Error('Number of segments must be zero')
    return {numSamples, startTime, endTime, minValue, maxValue}
}

export default useSeriesInfo