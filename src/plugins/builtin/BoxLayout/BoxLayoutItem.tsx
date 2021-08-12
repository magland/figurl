import Figure from 'figurl/labbox-react/MainWindow/Figure';
import { FigureObject } from 'figurl/types';
import React, { FunctionComponent } from 'react';

type Props = {
    figureObject: FigureObject
    width: number
    height: number
}

const BoxLayoutItem: FunctionComponent<Props> = ({figureObject, width, height}) => {
    return (
        <Figure
            figureObjectOrHash={figureObject}
            width={width}
            height={height}
        />
    )
}

export default BoxLayoutItem