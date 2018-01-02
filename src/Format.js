import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Derive from './Derive';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import Visibility from 'material-ui-icons/Visibility';
import VisibilityOff from 'material-ui-icons/VisibilityOff';
import ContentCopy  from 'material-ui-icons/ContentCopy';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { FormGroup, FormControlLabel, FormControl } from 'material-ui/Form';
import { CircularProgress } from 'material-ui/Progress';
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
import DoneIcon from 'material-ui-icons/Done';
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

const defaultState = {
  length: 12,
  digits: true,
  lowercase: true,
  uppercase: true,
  specialchar: false,
  nonce: 0,
  startsWith: '',
  editFormat: false,
  allowConsecutive: true,
  allowDuplicates: true,
};

class Format extends Component {
  constructor() {
    super();
    this.state = Object.assign(
      {},
      defaultState,
      {showPassword:false, copied: false}
    );
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
  componentWillReceiveProps(nextProps) {
    if(nextProps.passwordHash !== this.props.passwordHash) {
      this.setState(Object.assign({}, defaultState));
    }
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
  changeFormat(o) {
    this.setState(Object.assign({}, o, {copied: false}));
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
        onChange={(v) => this.changeFormat({length: v})}
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
      onChange={(e) => this.changeFormat({nonce: e.target.value})}
      />
    <br/>
    <TextField
      label='Start with'
      value={this.state.startsWith}
      onChange={(e) => this.changeFormat({startsWith: e.target.value})}
    />
    </div>
    <div style={{width:185, float:'left'}}>
      <FormControlLabel
        control={
          <Checkbox
            className={this.props.classes.checkBox}
            checked={this.state.digits}
            onChange={(e) => this.changeFormat({digits: e.target.checked})}
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
            onChange={(e) => this.changeFormat({lowercase: e.target.checked})}
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
            onChange={(e) => this.changeFormat({uppercase: e.target.checked})}
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
            onChange={(e) => this.changeFormat({specialchar: e.target.checked})}
            value="specialchar"
          />
        }
        label={__('Special Characters')}
      />
      <FormControlLabel
        control={
          <Checkbox
            className={this.props.classes.checkBox}
            checked={!this.state.allowConsecutive}
            onChange={(e) => this.changeFormat({allowConsecutive: !e.target.checked})}
            value="allowConsecutive"
          />
        }
        label={__('Avoid consecutive')}
      />
      <FormControlLabel
        control={
          <Checkbox
            className={this.props.classes.checkBox}
            checked={!this.state.allowDuplicates}
            onChange={(e) => this.changeFormat({allowDuplicates: !e.target.checked})}
            value="allowDuplicates"
          />
        }
        label={__('Avoid duplicates')}
      />
  </div>
  </div>
  }
  render() {
    console.log(this.props);
    if(this.props.working || !this.props.passwordHash) {
      return <div style={{marginTop: 10}}>
        <CircularProgress style={{
            float:'left',
            height:30,
            width:30,
            marginRight: 9,
            marginTop: 2
          }} />
        <div style={{
            float:'left',
            width:300
          }}>
          {!this.props.passwordHash?
            <strong>{__('Hashing your passphrase')}</strong>
            : <span>{__('Hashing your passphrase')}<DoneIcon style={{
              position: 'absolute',
              marginTop: -6,
              marginLeft: 10
            }}/></span>
          }<br/>
        {!this.props.passwordHash?
            __('Checking Format') :
            <strong>{__('Checking Format')}</strong>
          }
        </div>
        <div style={{clear: 'both'}}></div>
      </div>
    }
    const f = this.props.result ?
      FormatConverter.fromHex(this.props.result)
      : FormatConverter.create({
        length: this.state.length,
        nonce: this.state.nonce,
        startsWith: this.state.startsWith,
        allowConsecutive: this.state.allowConsecutive,
        allowDuplicates: this.state.allowDuplicates,
        allowedCharacters:
            (this.state.digits?CharacterClass.DIGITS:0)
          | (this.state.lowercase?CharacterClass.LOWERCASE:0)
          | (this.state.uppercase?CharacterClass.UPPERCASE:0)
          | (this.state.specialchar?CharacterClass.ACCENTUATED|CharacterClass.SYMBOLES:0)
        });
    const pass = f.randomStringFromKey(this.props.passwordHash);
    const { classes } = this.props;
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
      <div style={{clear: 'both'}}></div>
      <br/>

    <span style={{fontSize:'40px'}}><ForwardIcon /></span>
      <FormControl
        className={classes.formControl}>
        <InputLabel htmlFor="derivedKey">
          {__('Generated password')}</InputLabel>
        <Input
          id="derivedKey"
          readOnly
          type={this.state.showPassword ? 'text' : "password"}
          value={pass}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onClick={() => this.setState({showPassword: !this.state.showPassword})}
              >
                {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
      <CopyToClipboard text={pass}
        onCopy={() => this.setState({copied: true})}>
        <Button
          raised color="primary"
          className={classes.button} >
          {this.state.copied ?
            <DoneIcon className={classes.leftIcon} /> :
            <ContentCopy className={classes.leftIcon} />}
          {this.state.copied ? __('Copied') : __('Copy')}
        </Button>
      </CopyToClipboard>
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


export default DebounceComponent({
  delay:100,
  compute: ({passwordHash, application}) => {
    return new Promise((accept, reject) => {
      if(!passwordHash) {
        accept('');
      }
      scrypt(
        passwordHash,
        config.scryptFormatHashSaltPrefix+application,
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
  })(withStyles(styles)(Format));
