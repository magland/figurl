import { Button } from '@material-ui/core';
import { useGoogleSignInClient, useVisible } from 'figurl/labbox-react';
import Hyperlink from 'figurl/labbox-react/components/Hyperlink/Hyperlink';
import MarkdownDialog from 'figurl/labbox-react/components/Markdown/MarkdownDialog';
import ModalWindow from 'figurl/labbox-react/components/ModalWindow/ModalWindow';
import { WorkspaceState } from 'plugins/sortingview/gui/pluginInterface/workspaceReducer';
import React, { FunctionComponent } from 'react';
import { WorkspaceRoute, WorkspaceRouteDispatch } from "../../../pluginInterface";
import ImportRecordingsInstructions from './ImportRecordingsInstructions';
import RecordingsTable from './RecordingsTable';
import setSnippetLenMd from './setSnippetLen.md.gen';
import setWorkspacePermissionsMd from './setWorkspacePermissions.md.gen';

type Props = {
    workspace: WorkspaceState
    workspaceRoute: WorkspaceRoute
    onDeleteRecordings: ((recordingIds: string[]) => void) | undefined
    width: number
    height: number
    workspaceRouteDispatch: WorkspaceRouteDispatch
    workspaceUri: string
}

const WorkspaceHomeView: FunctionComponent<Props> = ({ width, height, workspace, onDeleteRecordings, workspaceRoute, workspaceRouteDispatch, workspaceUri }) => {
    const {recordings, sortings} = workspace
    const importInstructionsVisible = useVisible()
    const setWorkspacePermissionsVisible = useVisible()
    const setSnippetLengthVisible = useVisible()
    const loggedInUserEmail = useGoogleSignInClient()?.userId ?? 'user_id@gmail.com'
    return (
        <span>
            <div>
                {/* {
                    <pre>{JSON.stringify(userPermissions, null, 4)}</pre>
                } */}
                {
                    workspaceUri && (
                        <h3>{workspaceUri}</h3>
                    )
                }
                {
                    <div><Button onClick={setWorkspacePermissionsVisible.show}>Set workspace permissions</Button></div>
                }
                {
                    !importInstructionsVisible.visible && (
                        <div><Button onClick={importInstructionsVisible.show}>Import recordings</Button></div>
                    )
                }
                {
                    <p><Hyperlink onClick={setSnippetLengthVisible.show}>Snippets length</Hyperlink>: {workspace.snippetLen ? `(${workspace.snippetLen[0]}, ${workspace.snippetLen[1]})` : 'default'}</p>
                }
                <RecordingsTable
                    {...{sortings, recordings, onDeleteRecordings, workspaceRouteDispatch}}
                />
            </div>
            <ModalWindow
                open={importInstructionsVisible.visible}
                onClose={importInstructionsVisible.hide}
            >
                <ImportRecordingsInstructions
                    workspaceUri={workspaceUri}
                />
            </ModalWindow>
            <MarkdownDialog
                visible={setWorkspacePermissionsVisible.visible}
                onClose={setWorkspacePermissionsVisible.hide}
                source={setWorkspacePermissionsMd}
                substitute={{
                    'WORKSPACE_URI': workspaceUri,
                    'USER': loggedInUserEmail
                }}
            />
            <MarkdownDialog
                visible={setSnippetLengthVisible.visible}
                onClose={setSnippetLengthVisible.hide}
                source={setSnippetLenMd}
                substitute={{
                    'WORKSPACE_URI': workspaceUri
                }}
            />
        </span>
    )
}

export default WorkspaceHomeView