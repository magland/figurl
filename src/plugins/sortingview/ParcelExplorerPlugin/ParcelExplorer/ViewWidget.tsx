import React, { FunctionComponent } from 'react';
import { View, ViewPlugin, ViewProps } from './ViewPlugin';

type Props = {
    view: View
    viewProps: ViewProps
    width?: number
    height?: number
}

const ViewWidget: FunctionComponent<Props> = ({ view, viewProps, width, height }) => {
    const p = view.plugin as ViewPlugin
    const Component = p.component
    let pr: {[key: string]: any} = {}
    if (width) pr.width = width
    if (height) pr.height = height
    return (
        <Component {...viewProps} {...pr} {...view.extraProps} />
    )
}

export default ViewWidget