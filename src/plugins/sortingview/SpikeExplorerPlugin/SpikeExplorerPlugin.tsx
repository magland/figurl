import { isArrayOf, isNumber, isString, _validateObject } from "commonInterface/kacheryTypes";
import { useChannel, usePureCalculationTask } from "figurl/kachery-react";
import TaskStatusView from "figurl/kachery-react/components/TaskMonitor/TaskStatusView";
import { FigurlPlugin } from "figurl/types";
import React, { FunctionComponent } from 'react';
import SpikeExplorer from "./SpikeExplorer/SpikeExplorer";


type SpikeExplorerData = {
    numSpikes: number, // L
    numChannels: number, // M
    featureNames: string[], // K
    snippetsUri: string, // L x T x M
    timestampsUri: string, // L
    featuresUri: string // L x K
}
const isSpikeExplorerData = (x: any): x is SpikeExplorerData => {
    return _validateObject(x, {
        numSpikes: isNumber,
        numChannels: isNumber,
        featureNames: isArrayOf(isString),
        snippetsUri: isString,
        timestampsUri: isString,
        featuresUri: isString
    })
}

type Props = {
    data: SpikeExplorerData
    width: number
    height: number
}


const SpikeExplorerComponent: FunctionComponent<Props> = ({data, width, height}) => {
    const {snippetsUri, timestampsUri, featuresUri, featureNames} = data
    const {channelName, backendId} = useChannel()

    const {returnValue: snippets, task: snippetsTask} = usePureCalculationTask<number[][][]>(
        'sortingview.get_snippets_for_uri.1',
        {
            snippets_uri: snippetsUri
        },
        {
            channelName,
            backendId
        }
    )
    const {returnValue: timestamps, task: timestampsTask} = usePureCalculationTask<number[]>(
        'sortingview.get_timestamps_for_uri.1',
        {
            timestamps_uri: timestampsUri
        },
        {
            channelName,
            backendId
        }
    )
    const {returnValue: features, task: featuresTask} = usePureCalculationTask<number[][]>(
        'sortingview.get_features_for_uri.1',
        {
            features_uri: featuresUri
        },
        {
            channelName,
            backendId
        }
    )

    if (!snippets) return <TaskStatusView label="Loading snippets" task={snippetsTask} />
    if (!timestamps) return <TaskStatusView label="Loading timestamps" task={timestampsTask} />
    if (!features) return <TaskStatusView label="Loading features" task={featuresTask} />


    return (
        <SpikeExplorer
            snippets={snippets}
            timestamps={timestamps}
            features={features}
            featureNames={featureNames}
        />
    )
}

const SpikeExplorerPlugin: FigurlPlugin = {
    type: 'sortingview.spikeexplorer.1',
    validateData: isSpikeExplorerData,
    component: SpikeExplorerComponent
}

export default SpikeExplorerPlugin