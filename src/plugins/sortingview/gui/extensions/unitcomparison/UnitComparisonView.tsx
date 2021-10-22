// import Splitter from 'figurl/labbox-react/components/Splitter/Splitter'
// import React, { FunctionComponent } from 'react'
// import SelectUnitsWidget from '../../commonComponents/SelectUnitsWidget/SelectUnitsWidget'
// import { SortingViewProps } from "../../pluginInterface"
// import UnitComparisonWidget from './UnitComparisonWidget'

// const UnitComparisonView: FunctionComponent<SortingViewProps> = ({recording, sorting, selection, curation, selectionDispatch, width, height, snippetLen, sortingSelector}) => {

//     const selectedUnitIds = ((selection || {}).selectedUnitIds || [])

//     return (
//         <Splitter
//             width={width || 600}
//             height={height || 900} // how to determine default height?
//             initialPosition={200}
//         >
//             <SelectUnitsWidget sorting={sorting} selection={selection} selectionDispatch={selectionDispatch} curation={curation} sortingSelector={sortingSelector} />
//             {
//                 selectedUnitIds.length === 2 ? (
//                     <UnitComparisonWidget
//                         recording={recording}
//                         sorting={sorting}
//                         selection={selection}
//                         unitIds={selectedUnitIds}
//                         curation={curation}
//                         selectionDispatch={selectionDispatch}
//                         snippetLen={snippetLen}
//                         width={0} // will be filled in by the splitter
//                         height={0} // will be filled in by the splitter
//                         sortingSelector={sortingSelector}
//                     />
//                 ) : (
//                     <div>You must select exactly two units.</div>
//                 )
//             }
//         </Splitter>
//     )
// }

// export default UnitComparisonView

import DrawingHelloWorld, { DrawingHelloWorldClicks, DrawingHelloWorldDragRect } from 'figurl/labbox-react/components/DrawingWidget/DrawingHelloWorld'
import { Vec2 } from "figurl/labbox-react/components/DrawingWidget/Geometry"
import { Fragment, FunctionComponent } from 'react'
import { SortingViewProps } from "../../pluginInterface"

const UnitComparisonView: FunctionComponent<SortingViewProps> = ({recording, sorting, selection, curation, selectionDispatch, width, height, snippetLen, sortingSelector}) => {
    // Let's get 30 random points, we'll set the base dimensions to 50 w x 30 h.
    // (Don't want to deal with changing the aspect ratio for the canvases, that's a harder problem that we've solved elsewhere.)
    const points: Vec2[] = []
    for (let i = 0; i < 30; i++) {
        points.push([50 * Math.random(), 30 * Math.random()])
    }
    console.log(points)
    return <Fragment>
        <DrawingHelloWorld 
            dataPoints={points}
            width={500}
            height={300}
        />
        <hr />
        <DrawingHelloWorldClicks
            dataPoints={points}
            width={750}
            height={450}
        />
        <hr />
        <DrawingHelloWorldDragRect
            dataPoints={points}
            width={1000}
            height={600}
        />
    </Fragment>
}

export default UnitComparisonView