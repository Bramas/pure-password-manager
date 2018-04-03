const fr = require('./fr.json');
const crypto = require('crypto');
var bigInt = require("big-integer");

function randomInt (len) {
    return bigInt(crypto.randomBytes(128)
        .toString('hex'), 16).mod(len).toJSNumber();
}

const n = fr.length;
for(let i = 0; i < 6; i++)
{
  var v = randomInt(n);
  console.log(fr[v]);
}
