import { JSONObject } from "commonInterface/kacheryTypes";

type SeriesType = 'continuous' | 'discrete' | 'event'

export type SeriesManifestSegment = {
    start_time: number
    end_time: number
    num_samples: number
    min_value: number
    max_value: number
    timestamps_dtype: string
    timestamps_uri: string
    values_dtype: string
    values_uri: string
}

export type SeriesManifest = {
    type: SeriesType
    sampling_frequency: number,
    segments: SeriesManifestSegment[]
}

export type SeriesInfo = {
    uri: string
    manifest: SeriesManifest
    numSamples: number
    minValue: number
    maxValue: number
    startTime: number
    endTime: number
    type: SeriesType
    samplingFrequency: number
}