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
      format: ''
    };
  }
  toAscii(input) {
    return this.web3.toAscii(input).replace(/\u0000/g, '')
  }
  isPrivate() {
    return this.web3.isAddress(this.web3.eth.defaultAccount);
  }
  isMetaMask() {
    return this.web3.currentProvider.isMetaMask === true;
  }
  componentWillMount() {
    if (typeof window.web3 === 'undefined') {
      const Web3 = require('web3');
      const INFURA_API_KEY = require('./INFURA_API_KEY');
      // API key are freely available at infura.io
      this.web3 = new Web3(new Web3.providers.HttpProvider('https://'+config.etherNetwork+'.infura.io/'+INFURA_API_KEY));
    }else {
      this.web3 = window.web3;
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
      {this.isPrivate() ?
        <span><Button raised onClick={this.saveFormat.bind(this)}>Save in the Blockchain</Button>
          <br/>
          This will call our <a href={"https://"+config.etherNetwork+".etherscan.io/address/"+config.contractAddress}>smart contract</a> with this format
          so that every time you enter your passphrase with this website, the given format will be used.
        </span>
      : (this.isMetaMask() ?
        <span>
          <br/>
          Unlock MetaMask to save the format in the blockchain
        </span>
        :
        <span><br/>
          You'll have to remember the format for the next
          time you'll have to enter this password, or you can
          save it to the ethereum blockchain. To do so you can
          you can install <a href="https://metamask.io/">MetaMask</a>
          to be able to do it automatically or call <a href={"https://"+config.etherNetwork+".etherscan.io/address/"+config.contractAddress}>this contract</a> directly
        </span>
      )}
      {this.state.txHash ?
        <div>Transaction hash : <a href={"https://"+config.etherNetwork+".etherscan.io/tx/"+this.state.txHash}>{this.state.txHash}</a></div> : ''}
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
