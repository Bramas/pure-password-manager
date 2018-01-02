
import config from './config';

const Eth = {
  init: () => {
    if (typeof window.web3 === 'undefined') {
      const Web3 = require('web3');
      const INFURA_API_KEY = require('./INFURA_API_KEY');
      // API key are freely available at infura.io
      Eth.web3 = new Web3(new Web3.providers.HttpProvider('https://'+config.etherNetwork+'.infura.io/'+INFURA_API_KEY));
    }else {
      Eth.web3 = window.web3;
    }
    var passwordFormatContract = Eth.web3.eth.contract(config.contractABI);
    Eth.contractInstance = passwordFormatContract.at(config.contractAddress);
  }
}

export default Eth
