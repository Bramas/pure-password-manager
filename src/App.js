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
import Button from 'material-ui/Button';
import Visibility from 'material-ui-icons/Visibility';
import VisibilityOff from 'material-ui-icons/VisibilityOff';
import AddIcon from 'material-ui-icons/Add';
import Identicon from 'identicon.js';
import parse from 'url-parse';
import shajs from 'sha.js';

import {store as storePassphrase, remove as removePassphrase, load as loadPassphrase} from './passphraseStorage';
import {addIdleEvent, removeIdleEvent} from './utils';
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
  button: {
    margin: theme.spacing.unit,
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
      keyPassphrase: '',
      salt: app
    }
  }
  componentWillMount() {
    if(this.props.defaultSalt) {
      this.setState({salt: this.props.defaultSalt});
    }
  }
  updateKeyPassphrase(e) {

    this.setState({keyPassphrase: e.target.value,   wrongKeyPassphrase: false});
  }
  updatePassphrase(e) {
    this.setState({passphrase: e.target.value});
  }
  updateSalt(e) {
    this.setState({salt: e.target.value});
  }
  handleClickShowKeyPasssword()
  {
    this.setState({ showKeyPassword: !this.state.showKeyPassword });
  }
  handleMouseDownKeyPassword(e)
  {
    e.preventDefault();
  }
  handleClickShowPasssword()
  {
    this.setState({ showPassword: !this.state.showPassword });
  }
  handleMouseDownPassword(e)
  {
    e.preventDefault();
  }
  savePassphrase(e)
  {
    const saved = storePassphrase(this.state.passphrase);
    this.setState({ savedPassphrase: saved });
    this.planLock()
  }
  planLock() {
    this.removeIdleEvent = addIdleEvent(this.lock.bind(this), 2*1000);
  }
  lock() {
    this.setState({
      locked: true,
      passphrase: null
    });
  }
  unlock(e) {

    if(this.state.keyPassphrase)
    {
      const p = loadPassphrase(this.state.keyPassphrase);//this.state.savedPassphrase;
      if(!p) {
        this.setState({
          wrongKeyPassphrase: true
        });
        return;
      }
      this.setState({
        locked: false,
        passphrase: p,
        keyPassphrase: ''
      });
      this.planLock()
    }
  }
  unsavePassphrase(e) {
    //remove from storage
    if(this.removeIdleEvent) this.removeIdleEvent();
    removePassphrase();
    this.setState({ passphrase: '' });
    this.setState({ savedPassphrase: null });
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
    if(this.state.locked) {
      return <div>
      <FormControl
        className={classes.passphraseFormControl}>
        <InputLabel htmlFor="unlock_passphrase">
          {__('Last word of your passphrase')}
        </InputLabel>
        <Input
          error={this.state.wrongKeyPassphrase}
          inputProps={{tabIndex:1}}
          id="unlock_passphrase"
          onChange={this.updateKeyPassphrase.bind(this)}
          type={this.state.showKeyPassword ? 'text' : "password"}
          value={this.state.keyPassphrase}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onClick={this.handleClickShowKeyPasssword.bind(this)}
                onMouseDown={this.handleMouseDownKeyPassword.bind(this)}
              >
                {this.state.showKeyPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
        />
        </FormControl>
        <Button
          disabled={this.props.keyPassphrase == false}
          raised color="primary"
          className={classes.button}
          onClick={this.unlock.bind(this)} >
          {__('Unlock')}
        </Button>
      </div>
    }
    return (
      <div>{this.state.savedPassphrase ?
        <div>
          <div>The passphrase is saved.</div>,
          <div className="unsavePassphrase" onClick={this.unsavePassphrase.bind(this)}>delete</div>
        </div>
      :
        <div>
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
            <div className="savePassphrase" onClick={this.savePassphrase.bind(this)}>save</div>
          </div>
        }
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
          <Derive
            application={this.state.salt}
            passphrase={this.state.passphrase}
            actionButton={this.props.actionButton}
          />
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
