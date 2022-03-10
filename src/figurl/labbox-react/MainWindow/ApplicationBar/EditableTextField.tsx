import { Button, IconButton } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

type Props = {
    value: string
    onChange: (x: string) => void
    tooltip?: string
    multiline?: boolean
}

const EditableTextField: FunctionComponent<Props> = ({value, onChange, tooltip, multiline}) => {
    const [editing, setEditing] = useState<boolean>(false)
    if (editing) {
        return (
            <TextInput
                value={value}
                onChange={(x) => {
                    onChange(x)
                    setEditing(false)
                }}
                onCancel={() => setEditing(false)}
                multiline={multiline}
            />
        )
    }
    else {
        return (
            <span>
                {value}
                <EditButton
                    title={tooltip || ''}
                    onClick={() => setEditing(true)}
                />
            </span>
        )
    }
}

const TextInput: FunctionComponent<{value: string, onChange: (x: string) => void, onCancel: () => void, multiline?: boolean}> = ({value, onChange, onCancel, multiline}) => {
    const [internalValue, setInternalValue] = useState<string>('')
    useEffect(() => {
        setInternalValue(value)
    }, [value])
    const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback((e) => {
        setInternalValue(e.target.value as string)
    }, [])
    const handleSubmit = useCallback(() => {
        onChange(internalValue)
    }, [onChange, internalValue])
    return (
        <div>
            {
                multiline ? (
                    <textarea value={internalValue} onChange={handleChange} rows={10} cols={80} />
                ) : (
                    <input type="text" value={internalValue} onChange={handleChange} />
                )
            }
            <Button onClick={handleSubmit}>Submit</Button>
            <Button onClick={onCancel}>Cancel</Button>
        </div>
    )
}


const EditButton: FunctionComponent<{title: string, onClick: () => void}> = ({title, onClick}) => {
    return (
        <IconButton
            title={title}
            onClick={onClick}
        >
            <Edit />
        </IconButton>
    )
}

export default EditableTextField