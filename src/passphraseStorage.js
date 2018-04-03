
// Nodejs encryption with CTR
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';

function encrypt(text){
  const key = text.split(' ').slice(-1)[0]
  const hashedKey = crypto.createHash('sha256').update(key).digest();
  const iv = crypto.randomBytes(16)
  var cipher = crypto.createCipheriv(algorithm, hashedKey, iv)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return {text: crypted, iv};
}

function decrypt({text, iv}, key){
  const hashedKey = crypto.createHash('sha256').update(key).digest();
  var decipher = crypto.createDecipheriv(algorithm, hashedKey, iv)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}



function store(passphrase) {
  data = encrypt(passphrase)
  localStorage.setItem("passphrase", data);
}

store("hello world")
