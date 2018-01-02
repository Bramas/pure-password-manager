import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Derive from './Derive';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';

import { FormGroup, FormControlLabel } from 'material-ui/Form';
import Checkbox from 'material-ui/Checkbox';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import scrypt from 'scrypt-async';
import config from './config';
import __ from './locale';
import Eth from './ethereum';
import DebounceComponent from './DebounceComponent';
import FormatConverter, {CharacterClass} from './FormatConverter';
import blueGrey from 'material-ui/colors/blueGrey';
import Slider from 'rc-slider';
import SettingsIcon from 'material-ui-icons/Settings';
import ShuffleIcon from 'material-ui-icons/Shuffle';
import TuneIcon from 'material-ui-icons/Tune';
import ForwardIcon from 'material-ui-icons/Forward';
import TranslateIcon from 'material-ui-icons/Translate';
import 'rc-slider/assets/index.css';


function toAscii(hex) {
  var str = "";
  var i = 0, l = hex.length;
  if (hex.substring(0, 2) === '0x') {
      i = 2;
  }
  for (; i < l; i+=2) {
      var code = parseInt(hex.substr(i, 2), 16);
      if (code === 0) continue; // this is added
      str += String.fromCharCode(code);
  }

  return str;
}

class Format extends Component {
  constructor() {
    super();
    this.state = {
      length: 12,
      digits: true,
      lowercase: true,
      uppercase: true,
      specialchar: false,
      nonce: 0,
      startsWith: '',
      editFormat: false
    };
  }
  isPrivate() {
    return Eth.web3.isAddress(Eth.web3.eth.defaultAccount);
  }
  isMetaMask() {
    return Eth.web3.currentProvider.isMetaMask === true;
  }
  componentWillMount() {
    Eth.init();
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
          Eth.contractInstance.addPasswordFormat.sendTransaction(
            key,
            Eth.web3.fromAscii(format),
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
  updateFormat(e) {
    this.setState({format: e.target.value});
  }
  formatForm() {
    return  <div style={{
      float:'left',
      width: 410}}>
      <div style={{
        width:180,
        marginRight:20,
        marginTop: 13,
        //marginLeft:40,
        paddingRight:20,
        borderRight: '1px solid #bbbbbb',
        float:'left'}}>
      <Typography>
        {__('Length')}
          <span style={{float:'right', color:'#999999'}}>{this.state.length}</span>
      </Typography><br/>
      <Slider
        style={{width:180, display: 'inline-block'}}
        min={4}
        max={32}
        step={1}
        value={this.state.length}
        onChange={(v) => this.setState({length: v})}
        trackStyle={{
          backgroundColor: blueGrey[700],
          height: 6 }}
        handleStyle={{
          borderColor: blueGrey[700],
          height: 20,
          width: 20,
          marginLeft: -10,
          marginTop: -7,
        }}
        railStyle={{
          height: 6
        }}
      />
    <br/>
    <TextField
      label='Variation'
      type="number"
      value={this.state.nonce}
      onChange={(e) => this.setState({nonce: e.target.value})}
      />
    <br/>
    <TextField
      label='Start with'
      value={this.state.startsWith}
      onChange={(e) => this.setState({startsWith: e.target.value})}
    />
    </div>
    <div style={{width:185, float:'left'}}>
      <FormControlLabel
        control={
          <Checkbox
            className={this.props.classes.checkBox}
            checked={this.state.digits}
            onChange={(e) => this.setState({digits: e.target.checked})}
            value="digits"
          />
        }
        label={__('Numbers')}
      />
      <FormControlLabel
        control={
          <Checkbox
            className={this.props.classes.checkBox}
            checked={this.state.lowercase}
            onChange={(e) => this.setState({lowercase: e.target.checked})}
            value="lowercase"
          />
        }
        label={__('Lowercase')}
      />
      <FormControlLabel
        control={
          <Checkbox
            className={this.props.classes.checkBox}
            checked={this.state.uppercase}
            onChange={(e) => this.setState({uppercase: e.target.checked})}
            value="uppercase"
          />
        }
        label={__('Uppercase')}
      />
      <FormControlLabel
        control={
          <Checkbox
            className={this.props.classes.checkBox}
            checked={this.state.specialchar}
            onChange={(e) => this.setState({specialchar: e.target.checked})}
            value="specialchar"
          />
        }
        label={__('Special Characters')}
      />
  </div>
  </div>
  }
  render() {
    console.log(this.props);
    if(this.props.working || !this.props.values || !this.props.values.passwordHash) {
      return <div></div>;
    }
    const f = this.props.result ?
      FormatConverter.fromHex(this.props.result)
      : FormatConverter.create({
        length: this.state.length,
        nonce: this.state.nonce,
        startsWith: this.state.startsWith,
        allowedCharacters:
            (this.state.digits?CharacterClass.DIGITS:0)
          | (this.state.lowercase?CharacterClass.LOWERCASE:0)
          | (this.state.uppercase?CharacterClass.UPPERCASE:0)
          | (this.state.specialchar?CharacterClass.ACCENTUATED|CharacterClass.SYMBOLES:0)
        });
    return <div>
      <div style={{
          position: 'relative',
          fontSize:'40px',
          width:'40px',
          float:'left'
        }}><ShuffleIcon />
        {this.state.editFormat ? null :
          <Typography color='primary' type='subheading' style={{
          display: 'inline-block',
          position: 'absolute',
          left: 40,
          width: 300,
          top: 14}}>
            {__('12 Alphanumeric Characters')}
            <IconButton color="primary"
              className={this.props.classes.button}
              style={{
                position: 'absolute',
                top:-21
              }}
              onClick={(e) => this.setState({editFormat: true})}
              aria-label={__('Edit format')}>
              <TuneIcon />
            </IconButton>
          </Typography>}
      </div>
      {this.state.editFormat ? this.formatForm() : null}

      {this.props.values.passwordHash}<br/>
      {this.props.values.application}<br/>
      {this.props.result}<br/>

    <span style={{fontSize:'40px'}}><ForwardIcon /></span>
      {f.randomStringFromKey(this.props.values.passwordHash)}
      </div>
    /*return <div>
      <FormControlLabel
        control={
          <Checkbox
            checked={this.state.checkedA}
            onChange={this.handleChange('checkedA')}
            value="checkedA"
          />
        }
        label="Option A"
      />
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
    </div>*/
  }
}


Format.propTypes = {
  classes: PropTypes.object.isRequired,
};


const styles = theme => ({
  checkBox: {
    height:25
  },
  button: {
    margin: theme.spacing.unit,
  }
});



const Debounce = ({passwordHash, application}) =>
<DebounceComponent
  delay={100}
  component={withStyles(styles)(Format)}
  values={{passwordHash, application}}
  compute={
    (values) => {
      return new Promise((accept, reject) => {
        if(!values.passwordHash) {
          accept('');
        }
        scrypt(
          values.passwordHash,
          config.scryptFormatHashSaltPrefix+values.application,
          config.scryptFormatHashOptions,
          function(key) {
            key = '0x'+key;
            Eth.contractInstance.passwordFormat.call(
              key,
              function(err, format) {
                if(err) {
                  reject(err);
                  return;
                }
                accept(toAscii(format));
              });
          }
        )
      })
    }
  } />

export default Debounce;
