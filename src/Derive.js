
import React, { Component } from 'react';
import scrypt from 'scrypt-async';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import IconButton from 'material-ui/IconButton';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import Visibility from 'material-ui-icons/Visibility';
import VisibilityOff from 'material-ui-icons/VisibilityOff';
import ContentCopy  from 'material-ui-icons/ContentCopy';
import Button from 'material-ui/Button';
import Done from 'material-ui-icons/Done';
import __ from './locale';
import Format from './Format';
import { CircularProgress } from 'material-ui/Progress';

import config from './config';
import shajs from 'sha.js';

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
  formControl: {
    margin: theme.spacing.unit,
    width: 200,
  },
  loader: {
    margin: '40px auto',
    display: 'block'
  }
});
class Derive extends Component {
  constructor() {
    super();
    this.state = {
      passphrase: '',
      salt: '',
      derivedKey: false,
      copied: false,
      showPassword: false,
      working: false,
      needToGenerateAgain: false
    }
  }
  handleClickShowPasssword()
  {
    this.setState({ showPassword: !this.state.showPassword });
  }
  handleMouseDownPassword(e)
  {
    e.preventDefault();
  }
  componentWillReceiveProps(nextProps) {
    if(this.props.passphrase !== nextProps.passphrase
    || this.props.salt !== nextProps.salt)
    {
      this.planUpdateDerivedKey(nextProps.passphrase, nextProps.salt);
    }
  }
  componentDidMount() {
    this.updateDerivedKey(this.props.passphrase, this.props.salt);
  }
  planUpdateDerivedKey(passphrase, salt) {
    //if(!passphrase)
    //  return;
    this.setState({
      passphrase,
      salt,
      derivedKey: false
    });
    if(this.state.working) {
      return;
    }
    setTimeout(() => {
      if(this.state.passphrase !== passphrase
        || this.state.salt !== salt)
      {
        return;
      }
      this.updateDerivedKey(passphrase, salt)
    }, config.keyGenerationDelay);
  }
  updateDerivedKey(passphrase, salt) {
      if(!passphrase)
      {
        this.handleDerivedKey(passphrase, salt, '')
        return;
      }
      this.setState({
        working: true
      });
      scrypt(
        passphrase,
        salt,
        config.scryptOptions,
        this.handleDerivedKey.bind(this, passphrase, salt))

  }
  handleDerivedKey(passphrase, salt, derivedKey) {
    if(this.state.passphrase !== passphrase
    || this.state.salt !== salt) {
      this.updateDerivedKey(
        this.state.passphrase,
        this.state.salt);
      return;
    }
    derivedKey = derivedKey.replace(/\+|\//igm, '');
    this.setState({
      derivedKey: derivedKey || false,
      copied: false,
      working: false
    });
  }
  //https://gist.github.com/GeorgioWan/16a7ad2a255e8d5c7ed1aca3ab4aacec
  base64ToHex(str) {
    var hexString = new Buffer(str, 'base64').toString('hex');
    return hexString;
  }
  showPassword()
  {
    return this.state.derivedKey === false || this.state.showPassword;
  }
  render() {
    const { classes } = this.props;
    return (
      <span className="derivedKey">
        <FormControl
          className={classes.formControl}>
          <InputLabel htmlFor="derivedKey">{__('Generated password')}</InputLabel>
          <Input
            id="derivedKey"
            readOnly
            disabled={this.state.derivedKey === false}
            type={this.showPassword() ? 'text' : "password"}
            value={this.state.derivedKey === false ? '' : this.state.derivedKey.substr(0,12)}
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
        <CopyToClipboard text={this.state.derivedKey === false ? false : this.state.derivedKey.substr(0,12)}
          onCopy={() => this.setState({copied: true})}>
          <Button
            disabled={this.state.derivedKey === false}
            raised color="primary"
            className={classes.button} >
            {this.state.copied ?
              <Done className={classes.leftIcon} /> :
              <ContentCopy className={classes.leftIcon} />}
            {this.state.copied ? __('Copied') : __('Copy')}
          </Button>
        </CopyToClipboard>
        <br/>
        {this.state.derivedKey === false ?
          '' :
          <Format
            passwordHash={this.state.derivedKey}
            application={this.state.salt}/>
        }
      </span>

    );
  }
}


Derive.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Derive);
