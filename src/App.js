import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import PropTypes from 'prop-types';
import Derive from './Derive';
import scrypt from 'scrypt-async';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';

import __ from './locale';

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
});

class App extends Component {
  constructor() {
    super();
    this.state = {
      passphrase: '',
      salt: ''
    }
  }
  updatePassphrase(e) {
    this.setState({passphrase: e.target.value});
  }
  updateSalt(e) {
    this.setState({salt: e.target.value});
  }
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
      <Grid container spacing={24}>
        <Grid item xs={1}></Grid>
        <Grid item xs={10}>
          
          <Paper className={classes.paper}>
          <Typography type="display1">Stateless Password Manager</Typography>
          <TextField
              id="password"
              label={__('Main password')}
              className={classes.textField}
              margin="normal" 
               type="password"
              value={this.state.passphrase}
              onChange={this.updatePassphrase.bind(this)}
            />
            <TextField
              id="salt"
              label={__('Web site')}
              className={classes.textField}
              margin="normal" 
              value={this.state.salt}
              onChange={this.updateSalt.bind(this)}
            />
            <br/>
            <br/>
            <Derive salt={this.state.salt} passphrase={this.state.passphrase} />
          </Paper>
        </Grid>
        <Grid item xs={1}></Grid>
        </Grid>
        
        <Grid container spacing={24}>
          <Grid item xs={1}></Grid>
          <Grid item xs={10}>
          <Paper className={classes.paper}>
            <Typography type="paragraph">How does it work? </Typography>
            <Typography type="paragraph">The main password is hashed with scrypt using the destination
          website as a salt. The first 12 alphanumeric characters of the base64 encoded hashed value
          is the generated password.
          </Typography></Paper>
          </Grid>
          <Grid item xs={1}></Grid>
          </Grid>
        </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);

