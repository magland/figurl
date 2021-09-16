import React, { FunctionComponent } from 'react'
import ModalWindow from '../ModalWindow/ModalWindow'
import Markdown, {MarkdownProps} from './Markdown'

interface Props extends MarkdownProps {
    visible: boolean
    onClose: () => void
}

const MarkdownDialog: FunctionComponent<Props> = (props) => {
    const {visible, onClose} = props
    return (
        <ModalWindow
            open={visible}
            onClose={onClose}
        >
            <Markdown
                {...props}
            />
        </ModalWindow>
    )
}

export default MarkdownDialog