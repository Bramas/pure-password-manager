import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import Derive from './Derive';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import IconButton from 'material-ui/IconButton';
import Visibility from 'material-ui-icons/Visibility';
import VisibilityOff from 'material-ui-icons/VisibilityOff';
import AddIcon from 'material-ui-icons/Add';
import Identicon from 'identicon.js';
import parse from 'url-parse';
import shajs from 'sha.js';

import __ from './locale';

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 30,
  },
  paper: {
    padding: 25,
    textAlign: 'left',
    margin: 'auto',
    width: '450px',
    color: theme.palette.text.secondary,
  },
  textField: {
    marginTop: 20,
    marginLeft: 7,
    width: 200,
  },
  passphraseFormControl: {
    marginLeft: '40px',
    marginTop: '20px',
    marginRight: theme.spacing.unit,
    width: 340,
  },
  identiconWrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  identiconImg: {
    marginBottom: '-10px',
  },
  identiconHelpIcon: {
    top: '-15px',
    right: '-15px',
    border: 'solid 1px #dddddd',
    padding: '1px 4px',
    position: 'absolute',
    borderRadius: '31px',
    background: 'white',
    fontSize: '14px',
    cursor: 'help'
  },
  identiconHelp: {
    top: -22,
    right:-4,
    margin: '3px',
    padding: '20px',
    background: 'white',
    border: 'solid 1px #dddddd',
    position: 'absolute',
    cursor: 'help',
    width:400
  },
});

class App extends Component {
  constructor() {
    super();

    let url = parse(window.location, true);
    let app = url.query.app || '';
    if(!app && url.query.url) {
      url = parse(url.query.url, true);
      app = url.hostname.split('.').slice(-2)[0];
    }
    this.state = {
      passphrase: '',
      salt: app
    }
  }
  updatePassphrase(e) {
    this.setState({passphrase: e.target.value});
  }
  updateSalt(e) {
    this.setState({salt: e.target.value});
  }
  handleClickShowPasssword()
  {
    this.setState({ showPassword: !this.state.showPassword });
  }
  handleMouseDownPassword(e)
  {
    e.preventDefault();
  }
  renderIdenticon() {
    if(!this.state.passphrase)
    {
      /*if(this.state.working)
        return <CircularProgress
          className={this.props.classes.loader}
          size={50} />;*/
      return '';
    }
    var data = new Identicon(
      shajs('sha256').update(this.state.passphrase).digest('hex'),
      {
        size: 320,                                // 420px square
        format: 'svg'
      }
    ).toString();
    return <span
        className={this.props.classes.identiconWrapper}
        style={{width:60, height:60}}>
        <img
          alt="identicon"
          width={60}
          height={60}
          className={this.props.classes.identiconImg}
          src={'data:image/svg+xml;base64,' + data}
        /><div className="identicon-help-hover">
          <div
          className={this.props.classes.identiconHelpIcon}>
            ?
          </div>
          <div
            className={'identicon-help '+this.props.classes.identiconHelp}>
              {__('This image is a visual representation of '+
                 'your main password, you should familiarize'+
                 ' with it so that you can detect quickly '+
                 'if you mispelled your main password')}
          </div>
        </div>
      </span>
  }
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <Typography type="display1" style={{textAlign:'center'}}>Pure Password Manager</Typography>
          <br/>
          <FormControl
            className={classes.passphraseFormControl}>
            <InputLabel htmlFor="passphrase">
              {__('Main password')}
            </InputLabel>
            <Input
              inputProps={{tabIndex:1}}
              id="passphrase"
              onChange={this.updatePassphrase.bind(this)}
              type={this.state.showPassword ? 'text' : "password"}
              value={this.state.passphrase}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={this.handleClickShowPasssword.bind(this)}
                    onMouseDown={this.handleMouseDownPassword.bind(this)}
                  >
                    {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          {this.renderIdenticon()}
          <br/>
          <span style={{fontSize:'40px'}}><AddIcon /> </span>
          <FormControl
            className={classes.textField}>
            <InputLabel htmlFor="salt">
              {__('Application or Website')}
            </InputLabel>
            <Input
              inputProps={{tabIndex:2}}
              id="salt"
              value={this.state.salt}
              onChange={this.updateSalt.bind(this)}
            />
          </FormControl>
          <br/>
          <br/>
          <Derive application={this.state.salt} passphrase={this.state.passphrase} />
        </Paper>
        <Paper className={classes.paper}>
          <Typography type="caption">How does it work? </Typography>
          <Typography type="caption">The main password is hashed with scrypt using the destination
            website as salt. The first 12 alphanumeric characters of the base64 encoded hashed value
            is the generated password.<br/>
            If you like it, I accept donation in Ether at this address: 0x1Bcae562115A3bE1336FE2761647BBf0Ceb9574a
          </Typography>
        </Paper>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
