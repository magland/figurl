import { MuiThemeProvider } from '@material-ui/core';
import KacheryNodeSetup from 'figurl/kachery-react/KacheryNodeSetup';
import { GoogleSignInSetup } from 'figurl/labbox-react';
import MainWindow from 'figurl/labbox-react/MainWindow/MainWindow';
import { testSignatures } from 'commonInterface/crypto/signatures';
import { nodeLabel, TaskFunctionId } from 'commonInterface/kacheryTypes';
import React, { FunctionComponent, useMemo, useReducer } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import FigurlSetup from './FigurlSetup';
import './index.css';
import { initialRecentFigures, recentFiguresReducer } from './RecentFigures';
// import logo from './logo.svg';
import theme from './theme';
import { FigurlPlugin } from './types';

testSignatures()

type Props = {
  taskFunctionIds: TaskFunctionId[]
  plugins: FigurlPlugin[]
  packageName: string
  pythonProjectVersion: string
  webAppProjectVersion: string
  repoUrl: string
  logo: any
}

const FigurlApp: FunctionComponent<Props> = ({
  plugins, taskFunctionIds, packageName, pythonProjectVersion, webAppProjectVersion, repoUrl, logo
}) => {
  const [recentFigures, recentFiguresDispatch] = useReducer(recentFiguresReducer, initialRecentFigures)
  const homePageProps = useMemo(() => ({
    taskFunctionIds, packageName, pythonProjectVersion, webAppProjectVersion, repoUrl, recentFigures, plugins
  }), [taskFunctionIds, packageName, pythonProjectVersion, webAppProjectVersion, repoUrl, recentFigures, plugins])
  return (
    <div className="App">
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <GoogleSignInSetup>
            <KacheryNodeSetup nodeLabel={nodeLabel("figurl")}>
              <FigurlSetup plugins={plugins}>
                <MainWindow
                  packageName={packageName}
                  logo={logo}
                  homePageProps={homePageProps}
                  recentFigures={recentFigures}
                  recentFiguresDispatch={recentFiguresDispatch}
                />
              </FigurlSetup>
            </KacheryNodeSetup>
          </GoogleSignInSetup>
        </BrowserRouter>
      </MuiThemeProvider>
    </div>
  )
}

export default FigurlApp
