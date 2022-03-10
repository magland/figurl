import React, { FunctionComponent } from 'react';
import EditableTextField from './EditableTextField';

type Props = {
    description: string
    setDescription: (x: string) => void
}

const EditDescriptionControl: FunctionComponent<Props> = ({description, setDescription}) => {
    return (
        <EditableTextField
            value={description}
            onChange={setDescription}
            tooltip="Edit description"
            multiline={true}
        />
    )
}

export default EditDescriptionControl