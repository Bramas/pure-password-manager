import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import Derive from './Derive';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import IconButton from 'material-ui/IconButton';
import Visibility from 'material-ui-icons/Visibility';
import VisibilityOff from 'material-ui-icons/VisibilityOff';
import parse from 'url-parse';

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
    marginRight: theme.spacing.unit,
    width: 200,
  },
  passphraseFormControl: {
    marginLeft: '40px',
    marginRight: theme.spacing.unit,
    width: 400,
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
          <br/>
          <span style={{fontSize:'40px'}}>+ </span><TextField
            id="salt"
            label={__('Application or Website')}
            className={classes.textField}
            margin="normal"
            value={this.state.salt}
            onChange={this.updateSalt.bind(this)}
          />
          <br/>
          <br/>
          <span style={{fontSize:'40px'}}>= </span><Derive salt={this.state.salt} passphrase={this.state.passphrase} />
        </Paper>
        <Paper className={classes.paper}>
          <Typography type="caption">How does it work? </Typography>
          <Typography type="caption">The main password is hashed with scrypt using the destination
            website as salt. The first 12 alphanumeric characters of the base64 encoded hashed value
            is the generated password.
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
