import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import Expandable from 'figurl/labbox-react/components/Expandable/Expandable';
import Splitter from 'figurl/labbox-react/components/Splitter/Splitter';
import React, { FunctionComponent, useCallback, useMemo, useReducer } from 'react';
import { ParcelSorting } from '../ParcelExplorerPlugin';
import openViewsReducer from './openViewsReducer';
import ViewContainer from './ViewContainer';
import ViewLauncher from './ViewLauncher';
import { initialParcelSortingSelection, parcelSortingSelectionReducer, View, ViewPlugin, ViewProps } from './ViewPlugin';
import overviewClusterPlugin from './viewPlugins/overviewClusterPlugin/overviewClusterPlugin';
import ViewWidget from './ViewWidget';

type Props = {
    parcelSorting: ParcelSorting
    width: number
    height: number
}

const initialLeftPanelWidth = 320

const ParcelExplorer: FunctionComponent<Props> = ({parcelSorting, width, height}) => {
    const [parcelSortingSelection, parcelSortingSelectionDispatch] = useReducer(parcelSortingSelectionReducer, initialParcelSortingSelection)
    const featureRanges = useMemo(() => (computeFeatureRanges(parcelSorting)), [parcelSorting])

    const viewProps: ViewProps = useMemo(() => ({
        parcelSorting,
        parcelSortingSelection,
        parcelSortingSelectionDispatch,
        featureRanges,
        width: 0,
        height: 0
    }), [parcelSorting, parcelSortingSelection, parcelSortingSelectionDispatch, featureRanges])

    const [openViews, openViewsDispatch] = useReducer(openViewsReducer, [])

    const launchIcon = <span style={{color: 'gray'}}><OpenInBrowserIcon /></span>

    const plugins: ViewPlugin[] = useMemo(() => ([
        overviewClusterPlugin
    ]), [])
    
    const handleLaunchView = useCallback((plugin: ViewPlugin) => {
        openViewsDispatch({
            type: 'AddView',
            plugin,
            label: plugin.label,
            area: ''
        })
    }, [openViewsDispatch])

    const handleViewClosed = useCallback((v: View) => {
        openViewsDispatch({
            type: 'CloseView',
            view: v
        })
    }, [openViewsDispatch])

    const handleSetViewArea = useCallback((view: View, area: 'north' | 'south') => {
        openViewsDispatch({
            type: 'SetViewArea',
            viewId: view.viewId,
            area
        })
    }, [openViewsDispatch])

    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={initialLeftPanelWidth}
        >
            <div>
                {/* Launch */}
                <Expandable icon={launchIcon} label="Open views" defaultExpanded={true} unmountOnExit={false}>
                    <ViewLauncher
                        onLaunchView={handleLaunchView}
                        plugins={plugins}
                    />
                </Expandable>
            </div>
            <ViewContainer
                onViewClosed={handleViewClosed}
                onSetViewArea={handleSetViewArea}
                views={openViews}
                width={0} // will be replaced by splitter
                height={0} // will be replaced by splitter
            >
                {
                    openViews.map(v => (
                        <ViewWidget
                            key={v.viewId}
                            view={v}
                            viewProps={viewProps}
                        />
                    ))
                }
            </ViewContainer>
        </Splitter>
    )
}

const computeFeatureRanges = (parcelSorting: ParcelSorting) => {
    const numFeatures = parcelSorting.feature_components.length
    const ranges: {range: [number, number]}[] = []
    for (let i = 0; i < numFeatures; i++) {
        ranges.push({range: [0, 1]})
    }
    let first = true
    for (let segment of parcelSorting.segments) {
        for (let parcel of segment.parcels) {
            if (parcel.features.length >= 10) {
                for (let j = 0; j < parcel.features.length; j++) {
                    for (let i = 0; i < numFeatures; i++) {
                        const val = parcel.features[j][i]
                        if (first) {
                            ranges[i].range[0] = val
                            ranges[i].range[1] = val
                        }
                        else {
                            ranges[i].range[0] = Math.min(ranges[i].range[0], val)
                            ranges[i].range[1] = Math.max(ranges[i].range[1], val)
                        }
                    }
                    first = false
                }
            }
        }
    }
    return ranges
}

export default ParcelExplorer