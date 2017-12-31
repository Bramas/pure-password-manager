
var CharacterClass = Object.freeze({
  DIGITS:      1,
  LOWERCASE:   2,
  UPPERCASE:   4,
  ACCENTUATED: 8,
  SYMBOLES:    16,

  ALPHANUMERIC: 1+2+4,
  ALL:          1+2+4+8+16
});
var CharacterCharset = Object.freeze({
  DIGITS:      '0123456789',
  LOWERCASE:   'abcdefghijklmnopqrstuvwxyz',
  UPPERCASE:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ACCENTUATED: 'çÇüéëèêâäàáíïîìôöòóúûùÿýñÑÁÂÀÄÉÊËÈÍÎÏÌÓÔÒÖÜÚÛÙÝ',
  SYMBOLES:    '#$%&@|_~-*+/=,:;?!/([{}]) ',
});

const defaultOptions = {
  version:          1,  // 1 byte
  nonce:            0,  // 4 bytes
  length:           12, // 1 byte
  allowedCharacters:    // 2 bytes
                    CharacterClass.ALPHANUMERIC,
  allowConsecutive: true, // 1 bit
  allowDuplicates:  true, // 1 bit
  startWith:        ''    // 12 bytes
}
const optionSize = {
  version:           1,
  nonce:             4,
  length:            1,
  allowedCharacters: 2,
  allowOptions:      1, // 1 bit + 1 bit + alignment
  startWith:         12
}

function FormatConverter(options) {
  this.options = Object.assign(defaultOptions, options || {});
}

function padLeft(str, n){
  return Array(n-String(str).length+1).join('0')+str;
}
function padRight(str, n){
  return str + Array(n-String(str).length+1).join('0');
}
function toHex(i, bytes){
  return padLeft(i.toString(16).substr(0,bytes*2), bytes*2);
}

FormatConverter.prototype.toHex = function() {
  const hex = ['0x'];
  hex.push(toHex(this.options.version, optionSize.version));
  hex.push(toHex(this.options.nonce, optionSize.nonce));
  hex.push(toHex(this.options.allowedCharacters, optionSize.allowedCharacters));

  var allow = 0;
  allow |= this.options.allowConsecutive;
  allow |= this.options.allowDuplicates << 1;
  hex.push(toHex(allow, optionSize.allowOptions));

  var startWithHex = [...this.options.startWith]
    .map((c) => c.charCodeAt(0))
    .map((c) => toHex(c,1));
  hex.push(padRight(startWithHex.join('').substr(0, optionSize.startWith), optionSize.startWith*2));
  return hex.join('');
}

export default {
  fromHex: (hex) => {
    if(hex.substr(0,2) === '0x')
    {
      hex = hex.substr(2);
    }
    const options = {};

    options.version =
      parseInt(hex.substr(0,optionSize.version*2), 16);
      //console.log(hex.substr(0,optionSize.version), parseInt(hex.substr(0,optionSize.version), 16));
    hex = hex.substr(optionSize.version*2);

    options.nonce =
      parseInt(hex.substr(0,optionSize.nonce*2), 16);
    hex = hex.substr(optionSize.nonce*2);

    options.allowedCharacters =
      parseInt(hex.substr(0,optionSize.allowedCharacters*2), 16);
    hex = hex.substr(optionSize.allowedCharacters*2);

    var allowOptions =
      parseInt(hex.substr(0,optionSize.allowOptions*2), 16);
    hex = hex.substr(optionSize.allowOptions*2);

    options.allowConsecutive = !!(allowOptions & 1);
    options.allowDuplicates  = !!(allowOptions & (1 << 1));

    options.startWith = []
    for(let i = 0; i < optionSize.startWith; i++) {
      let c = parseInt(hex.substr(i*2,2), 16);
      options.startWith.push(String.fromCharCode(c));
    }
    options.startWith = options.startWith.join('').replace(/\u0000/g, '');
    hex = hex.substr(optionSize.startWith*2);
    return new FormatConverter(options);
  },
  create: (options) => {
    return new FormatConverter(options);
  }
}
