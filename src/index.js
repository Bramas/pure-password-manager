import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Button from 'material-ui/Button';
import ContentCopy  from 'material-ui-icons/ContentCopy';

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


class Action extends Component {
  constructor(){
    super()
    this.state = {
      copied: false
    }
  }
  render() {
    return
      <CopyToClipboard text={this.props.password}
        onCopy={() => this.setState({copied: true})}>
        <Button
          disabled={this.props.password === false}
          raised color="primary"
          className={classes.button} >
          {this.state.copied ?
            <Done className={classes.leftIcon} /> :
            <ContentCopy className={classes.leftIcon} />}
          {this.state.copied ? __('Copied') : __('Copy')}
        </Button>
      </CopyToClipboard>
  }
}

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <div className={classes.root}>
      <Typography type="display1" style={{textAlign:'center'}}>Pure Password Manager</Typography>
      <br/>
      <App actionButton={Action} />
      <Paper className={classes.paper}>
        <Typography type="caption">How does it work? </Typography>
        <Typography type="caption">The main password is hashed with scrypt using the destination
          website as salt. The first 12 alphanumeric characters of the base64 encoded hashed value
          is the generated password.<br/>
          If you like it, I accept donation in Ether at this address: 0x1Bcae562115A3bE1336FE2761647BBf0Ceb9574a
        </Typography>
      </Paper>
    </div>
  </MuiThemeProvider>, document.getElementById('root'));
registerServiceWorker();
