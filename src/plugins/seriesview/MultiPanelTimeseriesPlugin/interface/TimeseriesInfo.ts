import { JSONObject } from "commonInterface/kacheryTypes";

export interface ChannelPropertiesInterface {
    location: number[]
}

export type TimeseriesInfo = {
    uri: string
    object: JSONObject
    channelNames: string[]
    numSamples: number
    startTime: number
    endTime: number
    type: 'continuous' | 'discrete' | 'event'
    samplingFrequency: number
    channelProperties?: {[key: string]: ChannelPropertiesInterface}
}