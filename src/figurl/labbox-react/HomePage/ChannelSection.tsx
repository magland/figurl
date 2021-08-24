import { IconButton } from '@material-ui/core'
import { Help } from '@material-ui/icons'
import { ChannelName, TaskFunctionId } from 'kachery-js/types/kacheryTypes'
import RecentlyUsedBackends from 'figurl/kachery-react/components/SelectChannel/RecentlyUsedChannels'
import { useVisible } from '..'
import Hyperlink from '../components/Hyperlink/Hyperlink'
import MarkdownDialog from '../components/Markdown/MarkdownDialog'
import React, { FunctionComponent, useCallback } from 'react'
import useRoute from '../MainWindow/useRoute'
import aboutKacheryChannelsMd from './aboutKacheryChannels.md.gen'
import CheckBackendPythonPackageVersion from './CheckBackendPythonPackageVersion'
import CheckRegisteredTaskFunctions from './CheckRegisteredTaskFunctions'
import hyperlinkStyle from './hyperlinkStyle'
import { useChannel } from 'figurl/kachery-react'

type Props = {
    onSelectChannel: () => void
    taskFunctionIds: TaskFunctionId[]
    packageName: string
}

const ChannelSection: FunctionComponent<Props> = ({onSelectChannel, taskFunctionIds, packageName}) => {
    const {setRoute} = useRoute()
    const {channelName, backendId} = useChannel()
    // const channelInfo = useBackendInfo()
    // const backendPythonProjectVersion = backendInfo.backendPythonProjectVersion
    // const {visible: customBackendInstructionsVisible, show: showCustomBackendInstructions, hide: hideCustomBackendInstructions} = useVisible()
    const aboutKacheryChannelsVisible = useVisible()
    const handleSetChannel = useCallback((channel: ChannelName) => {
        setRoute({channel})
    }, [setRoute])
    return (
        <div className="ChannelSection HomeSection">
            <h3>Select a kachery channel <IconButton onClick={aboutKacheryChannelsVisible.show}><Help /></IconButton></h3>
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
                        <CheckRegisteredTaskFunctions
                            channelName={channelName}
                            backendId={backendId}
                            taskFunctionIds={taskFunctionIds}
                        />
                        <CheckBackendPythonPackageVersion packageName={packageName} />
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
            <MarkdownDialog
                visible={aboutKacheryChannelsVisible.visible}
                onClose={aboutKacheryChannelsVisible.hide}
                source={aboutKacheryChannelsMd}
            />
            {/* <MarkdownDialog
                visible={customBackendInstructionsVisible}
                onClose={hideCustomBackendInstructions}
                source={customBackendInstructionsMd}
            /> */}
        </div>
    )
}

export default ChannelSection