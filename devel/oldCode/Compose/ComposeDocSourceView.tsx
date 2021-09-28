import React, { FunctionComponent } from 'react';
import Editor from 'react-simple-code-editor'
import prism from 'prismjs'
import 'prismjs/themes/prism.css'

type Props = {
    source: string
    onSourceChange: (source: string) => void
}

const ComposeDocSourceView: FunctionComponent<Props> = ({source, onSourceChange}) => {
    return (
        <Editor
            value={source}
            onValueChange={onSourceChange}
            highlight={code => (prism.highlight(code, prism.languages["markup"], "markup"))}
            padding={10}
            style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
            }}
        />
    )
}

export default ComposeDocSourceView