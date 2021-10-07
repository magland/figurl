import React, { Fragment, FunctionComponent, useCallback } from 'react';
import { ViewPlugin } from './ViewPlugin';

export type ViewPluginType = 'RecordingView' | 'SortingView' | 'SortingUnitView' | 'SortingComparisonView'

type Props = {
    onLaunchView: (plugin: ViewPlugin) => void
    plugins: ViewPlugin[]
}

const buttonStyle: React.CSSProperties = {
    fontSize: 12,
    padding: 4,
    margin: 1
}

const ViewLauncher: FunctionComponent<Props> = ({ onLaunchView, plugins }) => {
    return (
        <Fragment>
            <div key="views" style={{flexFlow: 'wrap'}}>
                {
                    plugins.map(p => (
                        <LaunchViewButton key={p.name} plugin={p} onLaunch={onLaunchView} />
                    ))
                }
            </div>
        </Fragment>
    )
}

type LaunchViewButtonProps = {
    plugin:ViewPlugin
    onLaunch: (plugin: ViewPlugin) => void
}

const LaunchViewButton: FunctionComponent<LaunchViewButtonProps> = ({ plugin, onLaunch }) => {
    const handleClick = useCallback(() => {
        onLaunch(plugin)
    }, [onLaunch, plugin])
    return (
        <button onClick={handleClick} style={buttonStyle}>{
            plugin.icon && (
                <plugin.icon.type {...plugin.icon.props} style={{height: 14, width: 14, paddingRight: 2, paddingTop: 0}} />
            )}{plugin.label}</button>
    )
}

export default ViewLauncher