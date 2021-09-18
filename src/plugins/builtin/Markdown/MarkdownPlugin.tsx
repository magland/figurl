import Markdown from "commonComponents/Markdown/Markdown";
import { isString, _validateObject } from "commonInterface/kacheryTypes";
import { FigurlPlugin } from "figurl/types";
import { FunctionComponent } from "react";

type MarkdownData = {
    source: string
}
const isMarkdownData = (x: any): x is MarkdownData => {
    return _validateObject(x, {
        source: isString
    })
}

type Props = {
    data: MarkdownData
    width: number
    height: number
}

const MarkdownComponent: FunctionComponent<Props> = ({data, width, height}) => {
    const {source} = data
    return (
        <div
            style={{width: width - 70, height: height - 70, overflow: 'auto', padding: 35}}
        >
            <Markdown
                source={source}
                linkTarget="_blank"
            />
        </div>
    )
}

const MarkdownPlugin: FigurlPlugin = {
    type: 'Markdown.1',
    validateData: isMarkdownData,
    component: MarkdownComponent
}

export default MarkdownPlugin