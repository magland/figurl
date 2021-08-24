import Splitter from 'figurl/labbox-react/components/Splitter/Splitter'
import { SortingViewProps } from 'plugins/sortingview/gui/pluginInterface'
import React, { FunctionComponent } from 'react'
import SelectUnitsWidget from './SelectUnitsWidget'
import SpikeAmplitudesTimeWidget from './SpikeAmplitudesTimeWidget'
import useSpikeAmplitudesData from './useSpikeAmplitudesData'

const SpikeAmplitudesView: FunctionComponent<SortingViewProps> = ({recording, sorting, selection, selectionDispatch, curation, width, height, snippetLen, sortingSelector}) => {
    const spikeAmplitudesData = useSpikeAmplitudesData(recording.recordingObject, sorting.sortingObject, snippetLen)
    if (!spikeAmplitudesData) {
        return <div>Creating spike amplitudes data...</div>
    }
    return (
        <Splitter
            width={width || 600}
            height={height || 900} // how to determine default height?
            initialPosition={200}
        >
            <SelectUnitsWidget sorting={sorting} selection={selection} selectionDispatch={selectionDispatch} curation={curation} sortingSelector={sortingSelector} />
            <SpikeAmplitudesTimeWidget
                spikeAmplitudesData={spikeAmplitudesData}
                recording={recording}
                sorting={sorting}
                unitIds={selection.selectedUnitIds || []}
                {...{width: 0, height: 0}} // filled in by splitter
                selection={selection}
                selectionDispatch={selectionDispatch}
                curation={curation}
            />
        </Splitter>
    )
}

export default SpikeAmplitudesView