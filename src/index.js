import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import blueGrey from 'material-ui/colors/blueGrey';
import deepPurple from 'material-ui/colors/deepPurple';

const theme = createMuiTheme({
  palette: {
    primary: blueGrey,
    secondary: deepPurple,
  },
  status: {
    danger: 'orange',
  },
});


ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <App />
  </MuiThemeProvider>, document.getElementById('root'));
registerServiceWorker();
