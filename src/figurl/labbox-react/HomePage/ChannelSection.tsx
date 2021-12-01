import { ChannelName, TaskFunctionId } from 'commonInterface/kacheryTypes'
import { useChannel } from 'figurl/kachery-react'
import RecentlyUsedBackends from 'figurl/kachery-react/components/SelectChannel/RecentlyUsedChannels'
import React, { FunctionComponent, useCallback } from 'react'
import Hyperlink from '../components/Hyperlink/Hyperlink'
import useRoute from '../MainWindow/useRoute'
import CheckBackend from './CheckBackendPythonPackageVersion'
import hyperlinkStyle from './hyperlinkStyle'

type Props = {
    onSelectChannel: () => void
    taskFunctionIds: TaskFunctionId[]
    packageName: string
}

const sortingviewTaskFunctionIds = {
    fetchAverageWaveform: 'fetch_average_waveform.2',
    individualClusterFeatures: 'individual_cluster_features.1',
    fetchCorrelogramPlotData: 'fetch_correlogram_plot_data.6',
    preloadExtractSnippets: 'preload_extract_snippets.2',
    pairClusterFeatures: 'pair_cluster_features.4',
    fetchUnitMetrics: 'fetch_unit_metrics.1',
    recordingInfo: 'recording_info.3',
    sortingInfo: 'sorting_info.3',
    sortingCurationAction: 'sortingview_workspace_sorting_curation_action.1',
    workspaceAction: 'sortingview_workspace_action.1',
    // getSortingUnitSnippets: 'get_sorting_unit_snippets.1',
    fetchSpikeAmplitudes: 'fetch_spike_amplitudes.1',
    getTimeseriesSegment: 'get_timeseries_segment.1',
    getBestMatchingUnits: 'get_best_matching_units.2',
    getFiringData: 'get_firing_data.1',
    getIsiViolationRates: 'get_isi_violation_rates.1',
    getPeakChannels: 'get_peak_channels.1',
    getUnitSnrs: 'get_unit_snrs.1',
    getPythonPackageVersion: 'sortingview.get_python_package_version.1'
}

const ChannelSection: FunctionComponent<Props> = ({onSelectChannel, taskFunctionIds, packageName}) => {
    const {setRoute} = useRoute()
    const {channelName, backendId} = useChannel()
    // const channelInfo = useBackendInfo()
    // const backendPythonProjectVersion = backendInfo.backendPythonProjectVersion
    // const {visible: customBackendInstructionsVisible, show: showCustomBackendInstructions, hide: hideCustomBackendInstructions} = useVisible()
    const handleSetChannel = useCallback((channel: ChannelName) => {
        setRoute({channel})
    }, [setRoute])
    return (
        <div className="ChannelSection HomeSection">
            <h3>Select a kachery channel</h3>
            {
                channelName ? (
                    <span>
                        <p>The selected channel is <span style={{fontWeight: 'bold'}}>{channelName}</span></p>
                        {/* {
                            backendPythonProjectVersion && (
                                <span>
                                    {
                                        backendPythonProjectVersion === pythonProjectVersion ? (
                                            <p>Backend Python project version is {backendInfo.backendPythonProjectVersion} (this is the expected version)</p>
                                        ) : (
                                            <p>Backend Python project version is {backendInfo.backendPythonProjectVersion} (expected version is {pythonProjectVersion})</p>
                                        )
                                    }
                                </span>
                            )
                        } */}
                        <p><Hyperlink style={hyperlinkStyle} onClick={onSelectChannel}>Select a different channel</Hyperlink></p>
                        {/* <p><Hyperlink style={hyperlinkStyle} onClick={showCustomBackendInstructions}>Use your own channel</Hyperlink></p> */}
                        {/* <CheckRegisteredTaskFunctions
                            channelName={channelName}
                            backendId={backendId}
                            taskFunctionIds={taskFunctionIds}
                        /> */}
                        <CheckBackend
                            packageName="sortingview"
                            taskFunctionIds={Object.values(sortingviewTaskFunctionIds)}
                            getPythonPackageVersionTaskFunctionId={sortingviewTaskFunctionIds.getPythonPackageVersion}
                            expectedPythonPackageVersion="0.5.0"
                        />
                    </span>
                ) : (
                    <span>
                        <p>Start by <Hyperlink style={hyperlinkStyle} onClick={onSelectChannel}>selecting a kachery channel</Hyperlink></p>
                        <RecentlyUsedBackends onSelectChannel={handleSetChannel} />
                        {/* <p><Hyperlink style={hyperlinkStyle} onClick={showCustomBackendInstructions}>Or use your own channel</Hyperlink></p> */}
                    </span>
                )
            }
            {
                backendId ? (
                    <p>The selected backend ID is: {backendId}</p>
                ) : (
                    <p>No backend ID is specified (using default)</p>
                )
            }
            {/* <MarkdownDialog
                visible={aboutKacheryChannelsVisible.visible}
                onClose={aboutKacheryChannelsVisible.hide}
                source={aboutKacheryChannelsMd}
            /> */}
            {/* <MarkdownDialog
                visible={customBackendInstructionsVisible}
                onClose={hideCustomBackendInstructions}
                source={customBackendInstructionsMd}
            /> */}
        </div>
    )
}

export default ChannelSection