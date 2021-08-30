import { useChannel, useKacheryNode, usePureCalculationTask, useSubfeedReducer } from 'figurl/kachery-react';
import TaskStatusView from 'figurl/kachery-react/components/TaskMonitor/TaskStatusView';
import { parseSubfeedUri } from 'figurl/kachery-react/useSubfeed';
import { KacheryNode } from 'kachery-js';
import Subfeed from 'kachery-js/feeds/Subfeed';
import { ChannelName, messageCount, subfeedPosition, unscaledDurationMsec } from 'kachery-js/types/kacheryTypes';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import ChainsTable from './ChainsTable';
import IterationsPlot from './IterationsPlot';
import { MCMCRunViewData } from './MCMCRunViewPlugin';
import ParameterSelector from './ParameterSelector';

type Props = {
    data: MCMCRunViewData
    width: number
    height: number
}

type MCMCIteration = {
    timestamp: number
    parameters: {[key: string]: any}
}

export type MCMCRunChain = {
    chainId: string
    iterations: MCMCIteration[]
    chainUri?: string
}

type MCMCRunData = {
    runId: string,
    runLabel: string,
    metaData: {[key: string]: any},
    timestamp: number,
    chains: MCMCRunChain[]
}

type MCMCRunAction = {
    type: 'AddChain',
    timestamp: number,
    chainId: string,
    chainUri: string
}

type ChainListItem = {
    chainId: string
    chainUri: string
}

const chainListReducer = (s: ChainListItem[], a: MCMCRunAction): ChainListItem[] => {
    if (a.type === 'AddChain') {
        return [
            ...s, {
                chainId: a.chainId,
                chainUri: a.chainUri
            }
        ]
    }
    else {
        return s
    }
}

class ChainHandler {
    #subfeed: Subfeed | undefined = undefined
    #numMessagesHandled = 0
    constructor(private kacheryNode: KacheryNode, private channelName: ChannelName, public chainUri: string, private onMessage: (msg: any) => void) {
        this.start()
    }
    async start() {
        const {feedId, subfeedHash} = parseSubfeedUri(this.chainUri)
        this.#subfeed = await this.kacheryNode.feedManager()._loadSubfeed(feedId, subfeedHash, this.channelName)
        while (true) {
            const messages = await this.#subfeed.waitForSignedMessages({position: subfeedPosition(this.#numMessagesHandled), maxNumMessages: messageCount(this.#numMessagesHandled), waitMsec: unscaledDurationMsec(10000)})
            for (let msg of messages) {
                this.onMessage(msg.body.message)
            }
            this.#numMessagesHandled += messages.length
        }
    }
}

type RunDataAction = {
    type: 'add-chain',
    chainId: string,
    chainUri: string
} | {
    type: 'add-iterations',
    chainId: string,
    iterations: MCMCIteration[]
}

const mcmcRunDataReducer = (s: MCMCRunData, a: RunDataAction): MCMCRunData => {
    if (a.type === 'add-chain') {
        return {
            ...s,
            chains: [
                ...s.chains,
                {
                    chainId: a.chainId,
                    chainUri: a.chainUri,
                    iterations: []
                }
            ]
        }
    }
    else if (a.type === 'add-iterations') {
        return {
            ...s,
            chains: s.chains.map(chain => {
                if (chain.chainId === a.chainId) {
                    return {
                        ...chain,
                        iterations: [...chain.iterations, ...a.iterations]
                    }
                }
                else {
                    return chain
                }
            })
        }
    }
    else return s
}

const useMCMCRun = (runUri: string, runId: string, runLabel: string, timestamp: number) => {
    const isFeed = runUri.startsWith('feed://')
    const chainHandlers = useRef<ChainHandler[]>([])
    const kacheryNode = useKacheryNode()
    const {channelName} = useChannel()
    const initialRunData: MCMCRunData = useMemo(() => ({
        runId,
        runLabel,
        metaData: {},
        timestamp,
        chains: []
    }), [runId, runLabel, timestamp])
    const [subfeedRunData, subfeedRunDataDispatch] = useReducer(mcmcRunDataReducer, initialRunData)
    const {returnValue: runData1, task} = usePureCalculationTask<MCMCRunData>(
        !isFeed ? 'mcmc-monitor.load-run-data.1' : undefined,
        {
            run_uri: runUri
        },
        {}
    )
    const addChain = useCallback((chainId: string, chainUri: string) => {
        subfeedRunDataDispatch({
            type: 'add-chain',
            chainId,
            chainUri
        })
    }, [])
    const addIterations = useCallback((chainId: string, iterations: MCMCIteration[]) => {
        subfeedRunDataDispatch({
            type: 'add-iterations',
            chainId,
            iterations
        })
    }, [])
    const {state: chainList} = useSubfeedReducer({subfeedUri: runUri}, chainListReducer, [], {actionField: false})
    useEffect(() => {
        chainList.forEach((c) => {
            let alreadyHas = false
            for (let ch of chainHandlers.current) {
                if (ch.chainUri === c.chainUri) alreadyHas = true
            }
            if (!alreadyHas) {
                addChain(c.chainId, c.chainUri)
                const onMessage = (msg: any) => {
                    if (msg.type === 'AddIterations') {
                        addIterations(c.chainId, msg.iterations)
                    }
                }
                const x = new ChainHandler(kacheryNode, channelName, c.chainUri, onMessage)
                chainHandlers.current.push(x)
            }
        })
    }, [chainList, kacheryNode, addChain, addIterations, channelName])
    if (isFeed) {
        return {runData: subfeedRunData}
    }
    else {
        return {runData: runData1, task}
    }
}

const emptyList: string[] = []

const hmargin = 15

const MCMCRunView: FunctionComponent<Props> = ({data, width, height}) => {
    const {runUri, runId, runLabel, timestamp} = data
    const {runData, task} = useMCMCRun(runUri, runId, runLabel, timestamp)
    const [selectedChainIds, setSelectedChainIds] = useState<string[] | undefined>(undefined)
    const selectedChains: MCMCRunChain[] = useMemo(() => {
        if (!runData) return []
        return runData.chains.filter(ch => (selectedChainIds?.includes(ch.chainId)))
    }, [runData, selectedChainIds])
    const [selectedParameter, setSelectedParameter] = useState<string>('')
    if (!runData) {
        return <TaskStatusView task={task} label="Loading MCMC run data" />
    }
    return (
        <div style={{width: width - hmargin * 2, height, overflowY: 'auto', overflowX: 'hidden', paddingLeft: hmargin}}>
            <h3>{runData.runLabel} ({runData.runId})</h3>
            <div><pre>Meta data: {JSON.stringify(runData.metaData)}</pre></div>
            <div><pre>Timestamp: {formatTime(new Date(runData.timestamp * 1000))}</pre></div>
            <ChainsTable
                chains={runData.chains}
                selectedChainIds={selectedChainIds || emptyList}
                onSelectedChainIdsChanged={setSelectedChainIds}
            />
            <ParameterSelector
                chains={runData.chains}
                selectedParameter={selectedParameter}
                onSelectedParameterChanged={setSelectedParameter}
            />
            <IterationsPlot
                width={width - 50}
                height={300}
                chains={selectedChains}
                parameter={selectedParameter || undefined}
            />
        </div>
    )
}

function formatTime(d: Date) {
    const datesAreOnSameDay = (first: Date, second: Date) =>
        first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate();
    let ret = '';
    if (!datesAreOnSameDay(d, new Date())) {
        ret += `${(d.getMonth() + 1)}/${d.getDate()}/${d.getFullYear()} `;
    }
    ret += `${d.toLocaleTimeString()}`
    return ret;
}

export default MCMCRunView