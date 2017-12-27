
import React, { Component } from 'react';
import scrypt from 'scrypt-async';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Identicon from 'identicon.js';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';
import IconButton from 'material-ui/IconButton';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Visibility from 'material-ui-icons/Visibility';
import VisibilityOff from 'material-ui-icons/VisibilityOff';
import ContentCopy  from 'material-ui-icons/ContentCopy';
import Button from 'material-ui/Button';
import Done from 'material-ui-icons/Done';
import __ from './locale';
var _ = require('lodash');

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 30,
  },
  paper: {
    padding: 16,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
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
});
class Derive extends Component {
  constructor() {
    super();
    this.state = {
      workingPassphrase: '',
      workingSalt: '',
      derivedKey: false,
      copied: false,
      showPassword: false
    }
  }  
  handleClickShowPasssword = () => {
    this.setState({ showPassword: !this.state.showPassword });
  };
  updateDerivedKey(passphrase, salt) {
    if(!passphrase)
      return;
    this.setState({
      workingPassphrase: passphrase, 
      workingSalt:salt,
      derivedKey: false
    });    
    setTimeout(() => {
      if(this.state.workingPassphrase != passphrase
      || this.state.workingSalt != salt
    )
      {
        return;
      }
    //_.debounce(() => {
      console.log('start');
        scrypt(passphrase, salt, {
          N: 16384,
          r: 8,
          p: 1,
          dkLen: 64,
          encoding: 'base64',
          interruptStep : 1000
      }, this.handleDerivedKey.bind(this, passphrase, salt))
    }, 1000);
  }
  componentWillReceiveProps(nextProps) {
    if(this.props.passphrase != nextProps.passphrase
    || this.props.salt != nextProps.salt)
    {
      this.updateDerivedKey(nextProps.passphrase, nextProps.salt);
    }
  }
  componentDidMount() {
    this.updateDerivedKey(this.props.passphrase, this.props.salt);
  }
  handleDerivedKey(passphrase, salt, derivedKey) {
    console.log('derived');
    derivedKey = derivedKey.replace(/\+|\//igm, '');
    this.setState({derivedKey, copied: false});
  }
  //https://gist.github.com/GeorgioWan/16a7ad2a255e8d5c7ed1aca3ab4aacec
  base64ToHex(str) {
    var hexString = new Buffer(str, 'base64').toString('hex');
    return hexString;
  }
  renderIdenticon() {
    if(!this.state.derivedKey)
    {
      return '';
    }
    var data = new Identicon(this.base64ToHex(this.state.derivedKey), 
    {
      size: 240,                                // 420px square
      format: 'svg'  
    }).toString();
    return <img width={240} height={240} src={'data:image/svg+xml;base64,' + data} />
  }
  render() {
    const { classes } = this.props;
    return (
      <div className="App">
      <TextField
        readOnly
        id="derivedKey"
        label={__('Generated password')}
        className={classes.textField}
        margin="normal" 
        type={this.state.derivedKey === false ? 'text' : "password"}
        value={this.state.derivedKey === false ? '' : this.state.derivedKey.substr(0,12)}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              onClick={this.handleClickShowPasssword}
              onMouseDown={this.handleMouseDownPassword}
            >
              {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
      />
        <CopyToClipboard text={this.state.derivedKey === false ? false : this.state.derivedKey.substr(0,12)}
          onCopy={() => this.setState({copied: true})}>
          <Button raised color="primary" className={classes.button} >
            {this.state.copied ? 
              <Done className={classes.leftIcon} /> :
              <ContentCopy className={classes.leftIcon} />}
            {this.state.copied ? __('Copied') : __('Copy')}
          </Button>
        </CopyToClipboard>
        <br/>
        {this.renderIdenticon()}
      </div>
      
    );
  }
}


Derive.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Derive);
