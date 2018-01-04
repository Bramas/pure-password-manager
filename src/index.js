import './config';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Button from 'material-ui/Button';
import ContentCopy  from 'material-ui-icons/ContentCopy';
import __ from './locale';
import DoneIcon from 'material-ui-icons/Done';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';

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

const styles = theme => ({
  checkBox: {
    height:25
  },
  button: {
    margin: theme.spacing.unit,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  formControl: {
    margin: theme.spacing.unit,
    width: 200,
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
    const  {classes} = this.props;
    return <CopyToClipboard text={this.props.password}
        onCopy={() => this.setState({copied: this.props.password})}>
        <Button
          disabled={this.props.password === false}
          raised color="primary"
          className={classes.button} >
          {this.state.copied === this.props.password ?
            <DoneIcon className={classes.leftIcon} /> :
            <ContentCopy className={classes.leftIcon} />}
          {this.state.copied === this.props.password ? __('Copied') : __('Copy')}
        </Button>
      </CopyToClipboard>
  }
}

const paperStyle={
    padding: 25,
    textAlign: 'left',
    margin: 'auto',
    width: '450px',
    color: theme.palette.text.secondary,
  }

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <div style={{
      flexGrow: 1,
      marginTop: 30,
    }}>
      <Typography type="display1" style={{textAlign:'center'}}>Pure Password Manager</Typography>
      <br/>
        <Paper style={paperStyle}>
          <App actionButton={withStyles(styles)(Action)} />
        </Paper>
      <Paper style={paperStyle}>
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
