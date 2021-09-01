import Splitter from 'figurl/labbox-react/components/Splitter/Splitter'
import useLocalUnitIds from 'plugins/sortingview/gui/pluginInterface/useLocalUnitIds'
import React, { FunctionComponent, useState } from 'react'
import LockableSelectUnitsWidget from '../../../commonComponents/SelectUnitsWidget/LockableSelectUnitsWidget'
import { SortingViewProps } from '../../../pluginInterface'
import SpikeAmplitudesTimeWidget from './SpikeAmplitudesTimeWidget'
import useSpikeAmplitudesData from './useSpikeAmplitudesData'

const SpikeAmplitudesView: FunctionComponent<SortingViewProps> = ({recording, sorting, selection, selectionDispatch, curation, width, height, snippetLen, sortingSelector}) => {
    const [locked, setLocked] = useState(false)
    const [selectionLocal, selectionDispatchLocal] = useLocalUnitIds(selection, selectionDispatch, locked)
    const spikeAmplitudesData = useSpikeAmplitudesData(recording.recordingObject, sorting.sortingObject, snippetLen)

    return (!spikeAmplitudesData)
        ? <div>Creating spike amplitudes data...</div>
        : (
            <Splitter
                width={width || 600}
                height={height || 900} // how to determine default height?
                initialPosition={200}
            >
                <LockableSelectUnitsWidget
                    sorting={sorting}
                    selection={selectionLocal}
                    selectionDispatch={selectionDispatchLocal}
                    curation={curation}
                    locked={locked}
                    toggleLockStateCallback={() => setLocked(!locked)}
                    sortingSelector={sortingSelector}
                />
                <SpikeAmplitudesTimeWidget
                    spikeAmplitudesData={spikeAmplitudesData}
                    recording={recording}
                    sorting={sorting}
                    unitIds={selectionLocal.selectedUnitIds || []}
                    {...{width: 0, height: 0}} // filled in by splitter
                    selection={selectionLocal}
                    selectionDispatch={selectionDispatchLocal}
                    curation={curation}
                />
            </Splitter>
        )
}

export default SpikeAmplitudesView