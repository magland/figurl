import FigurlApp from 'figurl/FigurlApp';
import React from 'react';
import ReactDOM from 'react-dom';
import taskFunctionIds from 'taskFunctionIds';
import logo from './logo.png';
import packageName from './packageName';
import reportWebVitals from './reportWebVitals';
import { pythonProjectVersion, webAppProjectVersion } from './version';

// async function test1() {
//   const resp = await axios.get(`http://localhost:20431/probe`, {responseType: 'text'})
//   const content = resp.data
//   console.log('Test connect to local daemon', content)
// }
// test1()

ReactDOM.render(
  // disable strict mode to supress: "findDOMNode is deprecated in StrictMode" warnings
  (
  // <React.StrictMode>
    <FigurlApp
      taskFunctionIds={taskFunctionIds}
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
