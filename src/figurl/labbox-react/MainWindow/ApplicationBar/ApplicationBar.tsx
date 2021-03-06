import { AppBar, Button, Toolbar } from '@material-ui/core';
import { useSignedIn } from 'commonComponents/googleSignIn/GoogleSignIn';
import { useChannel } from 'figurl/kachery-react';
import ConfigureChannel from 'figurl/kachery-react/components/ConfigureChannel/ConfigureChannel';
import ChannelControl from 'figurl/kachery-react/components/SelectChannel/ChannelControl';
import ExportControl from 'figurl/kachery-react/components/SelectChannel/ExportControl';
import SaveFigureControl from 'figurl/kachery-react/components/SelectChannel/SaveFigureControl';
import TaskMonitor from 'figurl/kachery-react/components/TaskMonitor/TaskMonitor';
import TaskMonitorControl from 'figurl/kachery-react/components/TaskMonitor/TaskMonitorControl';
import ModalWindow from 'figurl/labbox-react/components/ModalWindow/ModalWindow';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import useRoute from '../useRoute';
import ExportDialog from './ExportDialog';
import SaveFigureDialog from './SaveFigureDialog';

const appBarHeight = 50

type Props = {
    title: string
    logo?: any
    onHome?: () => void
}

// const homeButtonStyle: React.CSSProperties = {
//     paddingBottom: 0, color: 'white', fontFamily: 'sans-serif', fontWeight: 'bold',
//     cursor: 'pointer'
// }

export const useModalDialog = () => {
    const [visible, setVisible] = useState<boolean>(false)
    const handleOpen = useCallback(() => {
        setVisible(true)
    }, [])
    const handleClose = useCallback(() => {
        setVisible(false)
    }, [])
    return useMemo(() => ({
        visible,
        handleOpen,
        handleClose
    }), [visible, handleOpen, handleClose])
}

const ApplicationBar: FunctionComponent<Props> = ({ title, logo, onHome }) => {
    const {visible: exportVisible, handleOpen: openExport, handleClose: closeExport} = useModalDialog()
    const {visible: saveFigureVisible, handleOpen: openSaveFigure, handleClose: closeSaveFigure} = useModalDialog()
    const {visible: configureChannelVisible, handleOpen: openConfigureChannel, handleClose: closeConfigureChannel} = useModalDialog()
    const {visible: taskMonitorVisible, handleOpen: openTaskMonitor, handleClose: closeTaskMonitor} = useModalDialog()

    // const client = useGoogleSignInClient()
    // const gapi = client?.gapi
    const {wiki, routePath} = useRoute()

    // const signedIn = useSignedIn()
    const {signedIn, userId, gapi} = useSignedIn()
    const handleLogin = useCallback(() => {
        gapi.auth2.getAuthInstance().signIn();
    }, [gapi])
    const handleLogout = useCallback(() => {
        gapi.auth2.getAuthInstance().signOut()
        // setRoute({routePath: '/home'})
    }, [gapi])

    const {backendId} = useChannel()
    const channelControlColor = backendId ? 'orange' : 'white'
    const exportControlColor = 'white'

    return (
        <span>
            <AppBar position="static" style={{height: appBarHeight, color: 'white'}}>
                <Toolbar>
                {
                    logo && (<img src={logo} alt="logo" height={30} style={{paddingBottom: 5, cursor: 'pointer'}} onClick={onHome} />)
                }
                <div>&nbsp;&nbsp;&nbsp;{title}</div>
                {/* {
                    ((routePath === '/fig') && (figureLabel)) && (
                        <span style={{paddingLeft: 20}}>{figureLabel}</span>
                    )
                } */}
                {
                    ((routePath === '/doc') && (wiki)) && (
                        <span style={{paddingLeft: 20}}>{fileNameFromWiki(wiki)}</span>
                    )
                }
                <span style={{marginLeft: 'auto'}} />
                {
                    signedIn && (
                        <span style={{fontFamily: 'courier', color: 'lightgray'}}>{userId}</span>
                    )
                }
                <span style={{paddingBottom: 0, color: 'white'}}>
                    <ChannelControl onOpen={openConfigureChannel} color={channelControlColor} />
                </span>
                <span style={{paddingBottom: 0, color: 'white'}}>
                    <TaskMonitorControl onOpen={openTaskMonitor} color="white" />
                </span>
                {
                    routePath === '/f' && (
                        <span style={{paddingBottom: 0, color: 'white'}}>
                            <ExportControl onClick={openExport} color={exportControlColor} />
                        </span>
                    )
                }
                {
                    routePath === '/f' && (
                        <span style={{paddingBottom: 0, color: 'white'}}>
                            <SaveFigureControl onClick={openSaveFigure} color="white" />
                        </span>
                    )
                }
                {
                    signedIn ? (
                        <Button color="inherit" onClick={handleLogout}>Sign out</Button>
                    ) : (
                        <Button color="inherit" onClick={handleLogin}>Sign in</Button>
                    )
                }
                </Toolbar>
            </AppBar>
            <ModalWindow
                open={exportVisible}
                onClose={closeExport}
            >
                <ExportDialog
                    onClose={closeExport}
                />
            </ModalWindow>
            <ModalWindow
                open={saveFigureVisible}
                onClose={closeSaveFigure}
            >
                <SaveFigureDialog
                    onClose={closeSaveFigure}
                />
            </ModalWindow>
            <ModalWindow
                open={configureChannelVisible}
                onClose={closeConfigureChannel}
            >
                <ConfigureChannel
                    onClose={closeConfigureChannel}
                />
            </ModalWindow>
            <ModalWindow
                open={taskMonitorVisible}
                onClose={closeTaskMonitor}
            >
                <TaskMonitor
                    onClose={closeTaskMonitor}
                />
            </ModalWindow>
        </span>
    )
}

const fileNameFromWiki = (x: string) => {
    const a = x.split('/')
    return a[a.length - 1]
}

export default ApplicationBar