import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import { useChannel } from 'figurl/kachery-react';
import React, { FunctionComponent } from 'react';
import EditBackendIdControl from './EditBackendIdControl';

type Props = {
    onClose: () => void
}

const ConfigureChannel: FunctionComponent<Props> = () => {
    const {channelName} = useChannel()
    return (
        <div>
            <h2>Configure channel</h2>
            {
                channelName ? (
                    <div>
                        <Table style={{maxWidth: 260}}>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Channel:</TableCell>
                                    <TableCell>{channelName}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Backend ID:</TableCell>
                                    <TableCell><EditBackendIdControl /></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>

                    </div>
                ) : (
                    <div>No channel specified</div>
                )
            }
        </div>
    )
}

export default ConfigureChannel