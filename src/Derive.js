
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
import DebounceComponent from './DebounceComponent';
import { LinearProgress } from 'material-ui/Progress';

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
  //https://gist.github.com/GeorgioWan/16a7ad2a255e8d5c7ed1aca3ab4aacec
  base64ToHex(str) {
    var hexString = new Buffer(str, 'base64').toString('hex');
    return hexString;
  }
  showPassword()
  {
    return this.props.result === null || this.state.showPassword;
  }
  render() {
    const { classes } = this.props;
    return (
      <span className="derivedKey">
        <FormControl
          className={classes.formControl}>
          <InputLabel htmlFor="derivedKey">
            {this.props.working ? __('Generating password') : __('Generated password')}</InputLabel>
          <Input
            id="derivedKey"
            readOnly
            disabled={this.props.working || !this.props.result}
            type={this.showPassword() ? 'text' : "password"}
            value={this.props.result === null || this.props.working? '' : this.props.result.substr(0,12)}
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
          {this.props.working ? <LinearProgress style={{height:2}} color="accent" /> : null}
        </FormControl>
        <CopyToClipboard text={this.props.result === null ? null : this.props.result.substr(0,12)}
          onCopy={() => this.setState({copied: true})}>
          <Button
            disabled={this.props.result === null}
            raised color="primary"
            className={classes.button} >
            {this.state.copied ?
              <Done className={classes.leftIcon} /> :
              <ContentCopy className={classes.leftIcon} />}
            {this.state.copied ? __('Copied') : __('Copy')}
          </Button>
        </CopyToClipboard>
        <br/>
        {this.props.result && this.props.values ?
          <Format
            passwordHash={this.props.result}
            application={this.props.values.application}/>
            : ''
        }
      </span>

    );
  }
}


Derive.propTypes = {
  classes: PropTypes.object.isRequired,
};

const Debounce = ({passphrase, application}) =>
<DebounceComponent
  delay={100}
  component={withStyles(styles)(Derive)}
  values={{passphrase, application}}
  compute={
    (values) => {
      return new Promise((acc, rej) => {
        if(!values.passphrase) {
          acc('');
        }
        scrypt(
          values.passphrase,
          values.application,
          config.scryptOptions,
          (key) => {
            key = key.replace(/\+|\//igm, '');
            acc(key);
          })
      })
    }
  } />

export default Debounce;
