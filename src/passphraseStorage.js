
// Nodejs encryption with CTR
const CryptoJS = require("crypto-js");


function encrypt(text){
  const key = text.split(' ').slice(-1)[0]
  const hashedKey = CryptoJS.SHA256(key).toString(CryptoJS.enc.Base64);
  var array = new Uint32Array(4);

  var crypted = CryptoJS.AES.encrypt(text, hashedKey);

  crypted = {
      ciphertext:crypted.ciphertext,
      salt:crypted.salt,
      iv:crypted.iv,
    }
  crypted = JSON.stringify(crypted);

  return crypted
}

function decrypt(data, key){
  const hashedKey = CryptoJS.SHA256(key).toString(CryptoJS.enc.Base64);

  return CryptoJS.AES.decrypt(JSON.parse(data),
    hashedKey).toString(CryptoJS.enc.Utf8);
}


export function store(passphrase) {
  let data = encrypt(passphrase)
  console.log('store', data)
  localStorage.setItem("passphrase", data);
  return true;
}
export function load(key) {
  const data = localStorage.getItem("passphrase", data);
  console.log('load', data)
  if(!data) {
    return false;
  }
  return decrypt(data, key);
}
export function remove() {
  const data = localStorage.setItem("passphrase", null);
}
