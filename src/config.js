
if(process.env.BABEL_ENV === 'development')
{
  console.debug = console.log;
  console.log('development');
}
else {
  if(!process.env.BABEL_ENV)
  {
    //console.log('no BABEL_ENV environment variable', process.env.BABEL_ENV);
  }
  console.debug = () => {};
}


export default {
  etherNetwork: 'ropsten', // 'ropsten': testnet, 'mainnet': production net
  keyGenerationDelay: 200,
  scryptOptions: {
    N: 16384,
    r: 8,
    p: 1,
    dkLen: 128,
    encoding: 'hex',
    interruptStep : 100
  },
  scryptFormatHashOptions:{
    N: 16384,
    r: 8,
    p: 1,
    dkLen: 16,
    encoding: 'hex',
    interruptStep : 100
  },
  scryptFormatHashSaltPrefix : 'pure-formatHash-salt|',

  //ropsten testnet contract address
  contractAddress: "0xb4f57264d1145d26524D147A0ae6FF7A9E124E29",
  contractABI: [
  	{
  		"constant": true,
  		"inputs": [
  			{
  				"name": "",
  				"type": "bytes16"
  			}
  		],
  		"name": "passwordFormat",
  		"outputs": [
  			{
  				"name": "",
  				"type": "bytes32"
  			}
  		],
  		"payable": false,
  		"stateMutability": "view",
  		"type": "function"
  	},
  	{
  		"constant": true,
  		"inputs": [],
  		"name": "owner",
  		"outputs": [
  			{
  				"name": "",
  				"type": "address"
  			}
  		],
  		"payable": false,
  		"stateMutability": "view",
  		"type": "function"
  	},
  	{
  		"anonymous": false,
  		"inputs": [
  			{
  				"indexed": true,
  				"name": "_from",
  				"type": "address"
  			},
  			{
  				"indexed": false,
  				"name": "_value",
  				"type": "uint256"
  			}
  		],
  		"name": "Deposit",
  		"type": "event"
  	},
  	{
  		"constant": false,
  		"inputs": [
  			{
  				"name": "passwordHash",
  				"type": "bytes16"
  			},
  			{
  				"name": "format",
  				"type": "bytes32"
  			}
  		],
  		"name": "addPasswordFormat",
  		"outputs": [],
  		"payable": true,
  		"stateMutability": "payable",
  		"type": "function"
  	},
  	{
  		"constant": false,
  		"inputs": [],
  		"name": "withdraw",
  		"outputs": [],
  		"payable": false,
  		"stateMutability": "nonpayable",
  		"type": "function"
  	},
  	{
  		"payable": true,
  		"stateMutability": "payable",
  		"type": "fallback"
  	}
  ]
}
