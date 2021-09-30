import React, { FunctionComponent } from 'react';
import { TimeseriesSelection, TimeseriesSelectionDispatch } from './interface/TimeseriesSelection';
import { PanelData } from './MultiPanelTimeseriesPlugin';
import SeriesViewTimeseriesView from './SeriesViewTimeseriesView/SeriesViewTimeseriesView';

type Props = {
    panels: PanelData[]
    width: number
    height: number
    timeseriesSelection: TimeseriesSelection
    timeseriesSelectionDispatch: TimeseriesSelectionDispatch
}

const MultiPanelTimeseriesView: FunctionComponent<Props> = ({panels, width, height, timeseriesSelection, timeseriesSelectionDispatch}) => {
    const panelHeight = (height - panels.length * 3) / panels.length
    return (
        <div>
            {
                panels.map((panel, ii) => (
                    <div key={ii} style={{height: panelHeight}}>
                        <div>{panel.label}</div>
                        <SeriesViewTimeseriesView
                            seriesUri={panel.data.seriesUri}
                            width={width}
                            height={panelHeight - 40}
                            timeseriesSelection={timeseriesSelection}
                            timeseriesSelectionDispatch={timeseriesSelectionDispatch}
                            hideTimeSpan={true}
                            hideToolbar={true}
                            hideBottomBar={true}
                        />
                    </div>
                ))
            }
        </div>
    )
}

export default MultiPanelTimeseriesView