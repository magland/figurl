import Doc from 'figurl/Doc/Doc'
import Figure2 from 'figurl/Figure2/Figure2'
import { RecentFiguresAction } from 'figurl/RecentFigures'
import Status from 'figurl/Status/Status'
import React, { FunctionComponent } from 'react'
import HomePage, { HomePageProps } from '../HomePage/HomePage'
import Figure from './Figure'
import useRoute from './useRoute'

type Props = {
    width: number
    height: number
    homePageProps: HomePageProps
    recentFiguresDispatch: (a: RecentFiguresAction) => void
}

const Routes: FunctionComponent<Props> = (props) => {
    const {width, height, homePageProps, recentFiguresDispatch} = props
    const {routePath, figureObjectOrHash} = useRoute()

    if (routePath === '/about') {
        return <div>About</div>
    }
    else if (routePath === '/fig') {
        return (
            <Figure
                figureObjectOrHash={figureObjectOrHash}
                width={width}
                height={height}
                recentFiguresDispatch={recentFiguresDispatch}
            />
        )
    }
    else if (routePath === '/status') {
        return (
            <Status />
        )
    }
    // else if (routePath === '/compose') {
    //     return (
    //         <Compose />
    //     )
    // }
    else if (routePath === '/doc') {
        return (
            <Doc />
        )
    }
    else if (routePath === '/f') {
        return (
            <Figure2
                width={width}
                height={height}
            />
        )
    }
    else {
        return <HomePage {...homePageProps} />
    }
}

export default Routes