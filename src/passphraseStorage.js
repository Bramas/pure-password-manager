
// Nodejs encryption with CTR
const CryptoJS = require("crypto-js");


function encrypt(text){
  const key = text.split(' ').slice(-1)[0]
  const hashedKey = CryptoJS.SHA256(key).toString(CryptoJS.enc.Base64);

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

export function exists() {
  return !!localStorage.getItem("passphrase");
}

export function store(passphrase) {
  let data = encrypt(passphrase)
  console.log('store', data)
  localStorage.setItem("passphrase", data);
  return true;
}
export function load(key) {
  const data = localStorage.getItem("passphrase");
  console.log('load', data)
  if(!data) {
    return false;
  }
  console.log(key, data)
  return decrypt(data, key);
}
export function remove() {
  localStorage.removeItem("passphrase");
}
