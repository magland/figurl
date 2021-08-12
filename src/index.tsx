import FigurlApp from 'figurl/FigurlApp';
import React from 'react';
import ReactDOM from 'react-dom';
import taskFunctionIds from 'taskFunctionIds';
import figurlPlugins from './python/figurl/plugins/plugins';
import introMd from './intro.md.gen';
import packageName from './packageName';
import reportWebVitals from './reportWebVitals';
import logo from './logo.png';
import { pythonProjectVersion, webAppProjectVersion } from './version';

ReactDOM.render(
  // disable strict mode to supress: "findDOMNode is deprecated in StrictMode" warnings
  (
  // <React.StrictMode>
    <FigurlApp
      plugins={figurlPlugins}
      taskFunctionIds={taskFunctionIds}
      introMd={introMd}
      packageName={packageName}
      pythonProjectVersion={pythonProjectVersion}
      webAppProjectVersion={webAppProjectVersion}
      repoUrl={"https://github.com/magland/figurl"}
      logo={logo}
    />
    // </React.StrictMode>
  ),
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
