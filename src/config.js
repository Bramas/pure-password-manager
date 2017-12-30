

export default {
  keyGenerationDelay: 200,
  scryptOptions: {
    N: 16384,
    r: 8,
    p: 1,
    dkLen: 64,
    encoding: 'base64',
    interruptStep : 100
  },
  scryptSaltPrefix: 'pure-salt|',
  scryptFormatHashOptions:{
    N: 16384,
    r: 8,
    p: 1,
    dkLen: 20,
    encoding: 'hex',
    interruptStep : 100
  },
  scryptFormatHashSaltPrefix : 'pure-formatHash-salt|',
  contractAddress: "0x1058E0EB52dA0d5FdCEd7b357670Ba06eC95aF91",
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
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
}
