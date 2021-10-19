import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import { SortingSelectionDispatch, WaveformsMode } from "../../../pluginInterface";

type Props = {
    timepoint?: number
    waveform?: number[][]
    currentTimepoint?: number
    waveformsMode?: WaveformsMode
    ampScaleFactor?: number
    selectedElectrodeIds?: number[]
    noiseLevel: number
    samplingFrequency: number
    electrodeIds: number[]
    electrodeLocations: number[][]
    selectionDispatch: SortingSelectionDispatch
    width: number
    height: number
}

const SnippetBox: FunctionComponent<Props> = ({ timepoint, waveform, currentTimepoint, waveformsMode, ampScaleFactor, selectedElectrodeIds, noiseLevel, samplingFrequency, electrodeIds, electrodeLocations, selectionDispatch, width, height }) => {
    const [hasBeenVisible, setHasBeenVisible] = useState(false)
    const handleVisibilityChange = useCallback((isVisible: boolean) => {
        if ((isVisible) && (!hasBeenVisible)) setHasBeenVisible(true)
    }, [hasBeenVisible, setHasBeenVisible])
    const snippetTimepoint = useMemo(() => (timepoint || 0), [timepoint])
    const _waveform = useMemo(() => waveform, [waveform])
    const _currentTimepoint = useMemo(() => (currentTimepoint || 0), [currentTimepoint])
    const _selectedElectrodeIds = useMemo(() => (selectedElectrodeIds ?? []), [selectedElectrodeIds])
    const selected = useMemo(() => (
        Math.abs(snippetTimepoint - _currentTimepoint) < 20
    ), [snippetTimepoint, _currentTimepoint])
    const handleClick = useCallback(() => {
        timepoint && selectionDispatch({type: 'SetCurrentTimepoint', currentTimepoint: timepoint})
    }, [timepoint, selectionDispatch])
    return (
        <VisibilitySensor onChange={handleVisibilityChange} partialVisibility={true}>
            {
                hasBeenVisible && _waveform && _waveform.length > 0 ? (
                    <div className={selected ? "plotSelectedStyle" : ""} onClick={handleClick}>
                        {/* <WaveformWidget
                            waveforms={_waveform}
                            ampScaleFactor={ampScaleFactor || 1}
                            layoutMode={waveformsMode || 'geom'}
                            selectedElectrodeIds={_selectedElectrodeIds}
                            electrodeIds, electrodeLocations,
                            {...{selectionDispatch, noiseLevel, samplingFrequency, width, height}}
                            waveformOpts={defaultWaveformOpts}
                        /> */}
                        <p>FIXME SnippetBox</p>
                    </div>
                ) : (
                    <div style={{position: 'absolute', width, height}} />
                )
            }
        </VisibilitySensor>
    )
}

export default SnippetBox