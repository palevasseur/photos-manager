import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import { initFirebase } from './firebase';
import { initGoogleDrive } from './driveapi';

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);

initFirebase();
initGoogleDrive();
registerServiceWorker();
