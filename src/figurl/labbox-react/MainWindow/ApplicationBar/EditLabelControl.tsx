import React, { FunctionComponent } from 'react';
import EditableTextField from './EditableTextField';

type Props = {
    label: string
    setLabel: (x: string) => void
}

const EditLabelControl: FunctionComponent<Props> = ({label, setLabel}) => {
    return (
        <EditableTextField
            value={label}
            onChange={setLabel}
            tooltip="Edit label"
        />
    )
}

export default EditLabelControl