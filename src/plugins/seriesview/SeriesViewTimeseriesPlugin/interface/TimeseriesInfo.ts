import { JSONObject } from "commonInterface/kacheryTypes";

export interface ChannelPropertiesInterface {
    location: number[]
}

export type TimeseriesInfo = {
    object: JSONObject
    channelNames: string[]
    numSamples: number
    startTime: number
    endTime: number
    type: 'continuous' | 'discrete'
    samplingFrequency: number
    noiseLevel?: number
    channelProperties?: {[key: string]: ChannelPropertiesInterface}
}