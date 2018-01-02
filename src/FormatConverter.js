
import shajs from 'sha.js';
var bigInt = require("big-integer");

export const CharacterClass = Object.freeze({
  DIGITS:      1,
  LOWERCASE:   2,
  UPPERCASE:   4,
  ACCENTUATED: 8,
  SYMBOLES:    16,

  ALPHANUMERIC: 1+2+4,
  ALL:          1+2+4+8+16
});
export const CharacterCharset = Object.freeze({
  1:      '0123456789',
  2:   'abcdefghijklmnopqrstuvwxyz',
  4:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  8: 'çÇüéëèêâäàáíïîìôöòóúûùÿýñÑÁÂÀÄÉÊËÈÍÎÏÌÓÔÒÖÜÚÛÙÝ',
  16:    '#$%&@|_~-*+/=,:;?!/([{}]) ',
});

const defaultOptions = {
  version:          1,  // 1 byte
  nonce:            0,  // 4 bytes
  length:           12, // 1 byte
  allowedCharacters:    // 2 bytes
                    CharacterClass.ALPHANUMERIC,
  allowConsecutive: true, // 1 bit
  allowDuplicates:  true, // 1 bit
  startsWith:        ''    // 12 bytes
}
const optionSize = {
  version:           1,
  nonce:             4,
  length:            1,
  allowedCharacters: 2,
  allowOptions:      1, // 1 bit + 1 bit + alignment
  startsWith:         12
}

function FormatConverter(options) {
  this.options = Object.assign({}, defaultOptions, options || {});
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

  var startsWithHex = [...this.options.startsWith]
    .map((c) => c.charCodeAt(0))
    .map((c) => toHex(c,1));
  hex.push(padRight(startsWithHex.join('').substr(0, optionSize.startsWith), optionSize.startsWith*2));
  return hex.join('');
}

function power_of_2(n) {
 if (typeof n !== 'number')
      return 'Not a number';

    return n && (n & (n - 1)) === 0;
}


FormatConverter.prototype.getCharset =
  function()
{
  const charset = [];
  let cl = this.options.allowedCharacters;
  for(let i in CharacterCharset) {
    if(cl & i) {
      charset.push(CharacterCharset[i]);
    }
  }
  return charset.join('');
}

function getBestBlockSize(randomRange, maximumBlockSize){

  let blockSize = Math.floor(maximumBlockSize);
  //if the blockSize is smaller than 1, we set it to 1
  // so that the random string might be periodic
  // but at least it will be of the requested size.
  if(blockSize < 1) {
    blockSize = 1;
  }
  if(power_of_2(randomRange))
  {
    const l = Math.round(Math.log2(randomRange));
    if(l>= 1 && l < blockSize)
      return l;
  }
  return blockSize;
}
/**
* swap characters in a string
*/
function swap(str, i, j){
  if(i>=j) return str;
  return str.substring(0, i)
        +str[j]+str.substring(i+1,j)
        +str[i]+str.substr(j+1);
}

function shuffleKFirst(charset, k, randInput)
{
  if(k > charset.length) {
    console.log(
      'Warning shuffleKFirst: the length of the string '+
      'you are trying to generate is smaller than the '+
      'size of the available set of characters'
    );
    k = charset.length
  }
  let offset = 0;
  for(let i = 0; i < k; i++)
  {
    const blockSize = getBestBlockSize(charset.length - i, (randInput.length-offset)/(k-i))
    let value = parseInt(randInput.substr(offset, blockSize), 2);
    value %= charset.length - i;
    charset = swap(charset, i, i + value);
    offset += blockSize;
    offset %= randInput.length;
  }
  return charset.substr(0, k);
}

FormatConverter.prototype.saltWithNonce = function(keyHex)
{
  keyHex.sh
  shajs.sha(512)
}


/**
* generate a random string from an hexadecimal key
*/
FormatConverter.prototype.randomStringFromKey =
  function(keyHex)
{
  if(this.options.nonce) {
    keyHex = this.saltWithNonce(key);
  }
  const charset = this.getCharset();

  let range = charset.length;
  if(!this.options.allowConsecutive)
    range = charset.length - 1;

  // length of the key in bits
  const keyLength = keyHex.length * 4;
  const key = padLeft(bigInt(keyHex, 16).toString(2), keyLength);

  if(!this.options.allowDuplicates)
  {
    return this.options.startsWith + shuffleKFirst(charset, this.options.length, key);
  }

  let blockSize = getBestBlockSize(
    range,
    key.length / this.options.length
  );

  const str = [];
  let lastValue = -1;
  for(let i = 0; i < this.options.length; i++)
  {
    const offset = (i * blockSize) % key.length;
    let value = parseInt(key.substr(offset, blockSize), 2);
    value = value % range;
    if(!this.options.allowConsecutive && value >= lastValue) {
      value++;
    }
    lastValue = value;
    str.push(charset[value]);
  }
  return this.options.startsWith + str.join('');
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

    options.startsWith = []
    for(let i = 0; i < optionSize.startsWith; i++) {
      let c = parseInt(hex.substr(i*2,2), 16);
      options.startsWith.push(String.fromCharCode(c));
    }
    options.startsWith = options.startsWith.join('').replace(/\u0000/g, '');
    hex = hex.substr(optionSize.startsWith*2);
    return new FormatConverter(options);
  },
  create: (options) => {
    return new FormatConverter(options);
  }
}
