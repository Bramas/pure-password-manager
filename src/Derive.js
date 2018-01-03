
import React, { Component } from 'react';
import scrypt from 'scrypt-async';
import Format from './Format';
import DebounceComponent from './DebounceComponent';
import config from './config';


class Derive extends Component {
  render()
  {
    const {passphrase, application, result} = this.props;
    if(!application && !passphrase) return '';

    return <Format
        passwordHash={result}
        application={application}
      />;
  }
}

export default DebounceComponent({
  delay:100,
  compute: ({passphrase, application}) => {
      return new Promise((acc, rej) => {
        if(!passphrase) {
          acc('');
        }
        scrypt(
          passphrase,
          application,
          config.scryptOptions,
          (key) => {
            key = key.replace(/\+|\//igm, '');
            acc(key);
          })
      })
    }
  })(Derive);
