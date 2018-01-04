
import config from './config';

const Eth = {
  init: () => {
    if (typeof window.web3 === 'undefined') {
      const Web3 = require('web3');
      const INFURA_API_KEY = require('./INFURA_API_KEY');
      // API key are freely available at infura.io
      Eth.web3 = new Web3(new Web3.providers.HttpProvider('https://'+config.etherNetwork+'.infura.io/'+INFURA_API_KEY));
    } else {
      Eth.web3 = window.web3;
    }
    var passwordFormatContract = Eth.web3.eth.contract(config.contractABI);
    Eth.contractInstance = passwordFormatContract.at(config.contractAddress);
  },
  isPrivate: () => {
    return Eth.web3.isAddress(Eth.web3.eth.defaultAccount);
  },
  isMetaMask: () => {
    return Eth.web3.currentProvider.isMetaMask === true;
  },
  saveFormat(key, format, value, cb) {
    console.debug('Saving Format to Blockchain', {key, format});
    try {
      Eth.contractInstance.addPasswordFormat.sendTransaction(
        key,
        format,
        {value},
        function(err, txHash) {
          if(err) {
            console.error(err);
          } else {
            console.debug('SAVED', {txHash});
          }
          cb(err, txHash);
        }
      );
    } catch(e) {
      cb(e, null);
    }
  }
}

export default Eth
