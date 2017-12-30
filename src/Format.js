import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Derive from './Derive';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import scrypt from 'scrypt-async';
import config from './config';
import __ from './locale';




class Format extends Component {
  constructor() {
    super();
    this.state = {
      privateAccountAvailable: false,
      format: ''
    };
  }
  toAscii(input) {
    return this.web3.toAscii(input).replace(/\u0000/g, '')
  }
  componentWillMount() {
    if (typeof window.web3 === 'undefined') {
      this.web3 = require('web3');
    }else {
      this.web3 = window.web3;
      this.setState({
        privateAccountAvailable: true
      });
    }
    var passwordFormatContract = this.web3.eth.contract(config.contractABI);
    this.contractInstance = passwordFormatContract.at(config.contractAddress);

    this.componentWillReceiveProps(this.props);
  }
  saveFormat()
  {
    let passwordHash = this.props.passwordHash;
    let application = this.props.application;
    let format = this.state.format;
    let self = this;
    console.log('Saving Format to Blockchain', {passwordHash, application, format});
    let p = new Promise((accept, reject) => {
      scrypt(
        passwordHash,
        config.scryptFormatHashSaltPrefix+application,
        config.scryptFormatHashOptions,
        function(key) {
          key = '0x'+key;
          self.contractInstance.addPasswordFormat.sendTransaction(
            key,
            self.web3.fromAscii(format),
            function(err, txHash) {
              if(err) {
                reject(err);
                return;
              }
              accept(txHash);
            });
        }
      )
    });
    p.then((txHash) => self.setState({txHash}))
    .catch(console.error);
  }
  getFormat(passwordHash, application)
  {
    let self = this;
    return new Promise((accept, reject) => {
      scrypt(
        passwordHash,
        config.scryptFormatHashSaltPrefix+application,
        config.scryptFormatHashOptions,
        function(key) {
          key = '0x'+key;
          console.log({key});
          self.contractInstance.passwordFormat.call(
            key,
            function(err, format) {
              if(err) {
                reject(err);
                return;
              }
              accept(self.toAscii(format));
            });
        }
      )
    })
  }
  componentWillReceiveProps(nextProps) {
    console.log('receive', nextProps);
    this.getFormat(nextProps.passwordHash, nextProps.application)
    .then((format) => {

      console.log('format', format);
      this.setState({format});
    }).catch((e) => console.log('error format', e));
  }
  updateFormat(e) {
    this.setState({format: e.target.value});
  }
  render() {
    return <div>
      <TextField
        id="format"
        label={__('Format')}
        className={this.props.classes.textField}
        margin="normal"
        value={this.state.format ? this.state.format : ''}
        onChange={this.updateFormat.bind(this)}
      />
      {this.state.privateAccountAvailable ?
        <Button onClick={this.saveFormat.bind(this)}>Save in the Blockchain</Button>
      : ''}
      {this.state.txHash ? this.state.txHash : ''}
    </div>
  }
}


Format.propTypes = {
  classes: PropTypes.object.isRequired,
};


const styles = theme => ({
  textField: {
    marginRight: theme.spacing.unit,
    width: 200,
  },
});
export default withStyles(styles)(Format);
