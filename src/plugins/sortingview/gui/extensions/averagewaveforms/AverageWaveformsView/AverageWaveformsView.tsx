import { IconButton } from '@material-ui/core'
import { Help } from '@material-ui/icons'
import { useVisible } from 'figurl/labbox-react'
import { useKeymap } from 'figurl/labbox-react/components/CanvasWidget'
import MarkdownDialog from 'figurl/labbox-react/components/Markdown/MarkdownDialog'
import Splitter from 'figurl/labbox-react/components/Splitter/Splitter'
import { useRecordingInfo } from 'plugins/sortingview/gui/pluginInterface/useRecordingInfo'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import SortingUnitPlotGrid from '../../../commonComponents/SortingUnitPlotGrid/SortingUnitPlotGrid'
import info from '../../../helpPages/AverageWaveforms.md.gen'
import { SortingViewProps } from '../../../pluginInterface'
import AmplitudeScaleToolbarEntries from '../../common/sharedToolbarSets/AmplitudeScaleToolbarEntries'
import { ActionItem, DividerItem, TextItem, ToggleableItem } from '../../common/Toolbars'
import ViewToolbar from '../../common/ViewToolbar'
import AverageWaveformView from './AverageWaveformView'


export type AverageWaveformAction = ActionItem  | ToggleableItem | DividerItem | TextItem

const TOOLBAR_INITIAL_WIDTH = 36 // hard-coded for now

const AverageWaveformsView: FunctionComponent<SortingViewProps> = (props) => {
    const {recording, sorting, curation, selection, selectionDispatch, width=600, height=650, snippetLen, sortingSelector} = props
    const recordingInfo = useRecordingInfo(recording.recordingPath)
    const boxHeight = 250
    const boxWidth = 180
    const noiseLevel = (recordingInfo || {}).noise_level || 1  // fix this

    const visibleElectrodeIds = useMemo(() => (selection.visibleElectrodeIds), [selection.visibleElectrodeIds])
    const selectedElectrodeIds = useMemo(() => (selection.selectedElectrodeIds || []), [selection.selectedElectrodeIds])
    const ampScaleFactor = useMemo(() => (selection.ampScaleFactor || 1), [selection.ampScaleFactor])
    const applyMerges = useMemo(() => (selection.applyMerges || false), [selection.applyMerges])
    const waveformsMode = useMemo(() => (selection.waveformsMode || 'geom'), [selection.waveformsMode])
    const _handleWaveformToggle = useCallback(() => {
        selectionDispatch({type: 'ToggleWaveformsMode', waveformsMode: waveformsMode})
    }, [selectionDispatch, waveformsMode])

    const amplitudeScaleControls = useMemo(() => {
        return AmplitudeScaleToolbarEntries({selectionDispatch, ampScaleFactor})
    }, [selectionDispatch, ampScaleFactor])

    // const keypressMap: KeypressMap = useMemo(() => {
    //     return Object.assign({}, ...amplitudeScaleControls.map((c) => (c.type === 'button' && c.keyCode ? {[c.keyCode]: c.callback } : {})))
    // }, [amplitudeScaleControls])

    const keypressMap = useKeymap(amplitudeScaleControls)

    const actions: AverageWaveformAction[] = useMemo(() => {
        return [...(amplitudeScaleControls || []),
        {
            type: 'divider'
        },
        {
            type: 'toggle',
            subtype: 'slider',
            callback: _handleWaveformToggle,
            title: waveformsMode === 'geom' ? 'Hide electrode geometry' : 'Show electrode geometry',
            selected: waveformsMode === 'geom'
        }]
    }, [amplitudeScaleControls, _handleWaveformToggle, waveformsMode])

    const unitComponent = useMemo(() => (unitId: number) => (
            <AverageWaveformView
                {...{sorting, curation, recording, unitId, selectionDispatch}}
                selectionDispatch={selectionDispatch}
                width={boxWidth}
                height={boxHeight}
                noiseLevel={noiseLevel}
                keypressMap={keypressMap}
                snippetLen={snippetLen}
                visibleElectrodeIds={visibleElectrodeIds}
                selectedElectrodeIds={selectedElectrodeIds}
                ampScaleFactor={ampScaleFactor}
                applyMerges={applyMerges}
                waveformsMode={waveformsMode}
            />
    ), [sorting, recording, selectionDispatch, noiseLevel, keypressMap, curation, snippetLen, visibleElectrodeIds, selectedElectrodeIds, ampScaleFactor, applyMerges, waveformsMode])

    const infoVisible = useVisible()

    return width ? (
        <div>
            <Splitter
                width={width}
                height={height}
                initialPosition={TOOLBAR_INITIAL_WIDTH}
                adjustable={false}
            >
                {
                    <ViewToolbar
                        width={TOOLBAR_INITIAL_WIDTH}
                        height={height}
                        customActions={actions}
                    />
                }
                {
                    <div>
                        <div>
                            <IconButton onClick={infoVisible.show}><Help /></IconButton>
                        </div>
                        <SortingUnitPlotGrid
                            sorting={sorting}
                            selection={selection}
                            curation={curation}
                            selectionDispatch={selectionDispatch}
                            unitComponent={unitComponent}
                            sortingSelector={sortingSelector}
                        />
                        <MarkdownDialog
                            visible={infoVisible.visible}
                            onClose={infoVisible.hide}
                            source={info}
                        />
                    </div>
                }
            </Splitter>
        </div>
    )
    : (<div>No width</div>);
}

export default AverageWaveformsView