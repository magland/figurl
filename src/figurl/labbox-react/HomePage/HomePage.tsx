import { ChannelName, TaskFunctionId } from 'commonInterface/kacheryTypes'
import SelectChannelDialog from 'figurl/kachery-react/components/SelectChannel/SelectChannelDialog'
import { RecentFigure, RecentFigures } from 'figurl/RecentFigures'
import React, { FunctionComponent } from 'react'
import { useVisible } from '..'
import ChannelSection from './ChannelSection'
import DocumentSection from './DocumentSection'
import './Home.css'
import IntroSection from './IntroSection'
import './localStyles.css'

export type HomePageProps = {
    taskFunctionIds: TaskFunctionId[]
    packageName: string
    pythonProjectVersion: string
    webAppProjectVersion: string
    repoUrl: string
    recentFigures: RecentFigures
    onOpenFigure?: (recentFigure: RecentFigure) => void
}

const hardCodedChannels = [] as any as ChannelName[]

const HomePage: FunctionComponent<HomePageProps> = ({taskFunctionIds, packageName, pythonProjectVersion, webAppProjectVersion, repoUrl, recentFigures, onOpenFigure}) => {
    const selectChannelVisibility = useVisible()

    return (
        <div style={{margin: 'auto', maxWidth: 1200, paddingLeft: 10, paddingRight: 10}}>
            
            <IntroSection />
            <ChannelSection onSelectChannel={selectChannelVisibility.show} taskFunctionIds={taskFunctionIds} packageName={packageName} />
            <DocumentSection />
            <span>
                <hr />
                <p style={{fontFamily: 'courier', color: 'gray'}}>Python package version: {packageName} {pythonProjectVersion} | GUI version: {webAppProjectVersion}</p>
            </span>
            
            <SelectChannelDialog
                visible={selectChannelVisibility.visible}
                onClose={selectChannelVisibility.hide}
                hardCodedChannels={hardCodedChannels}
            />
        </div>
    )
}

export default HomePage