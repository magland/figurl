import React, { FunctionComponent } from 'react';
import EditableTextField from './EditableTextField';

type Props = {
    folder: string
    setFolder: (x: string) => void
}

const EditFolderControl: FunctionComponent<Props> = ({folder, setFolder}) => {
    return (
        <EditableTextField
            value={folder}
            onChange={setFolder}
            tooltip="Edit folder"
        />
    )
}

export default EditFolderControl