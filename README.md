# Pure Password Manager

This application is still experimental, especially the 'save your format in the blockchain' feature. Currently, all the transactions
happen in the ropsten test network and once we migrate to the
main network, all your formats will be lost
(and so are you passwords if you do not remember
 those formats). The script to generate passwords should not change though,
 except if a bug is found.

URL : [https://bramas.github.io/pure-password-manager/](https://bramas.github.io/pure-password-manager/)

PurePM is a really simple password manager. It does not store any password locally nor in the cloud. For each application (or website), a unique password is generated from your main password and the name of the application using a cryptographically secured hash function (scrypt).

By default 12 alphanumeric characters are generated. Anytime you use PurePM with your main password and the name of the website (or application) the same specific 12 alphanumeric characters are generated. Doing this, everything is done in your browser and no communication are performed with any server. You can even download the website and perform all this offline if you want.

If you need (or want) you can choose another format for your password, like 24 lowercase letters, or a password that contains at least a special character.
The next time you use PurePM, if you select the same format, the same password will be generated. This implies that you have to remember what format you used for each website. To avoid this you can save the format in the ethereum blockchain calling a simple smart-contract that stores formats associated with a hashed version
of the password. To do this you will need to send a transaction to the ethereum blockchain (with a small fee, not for me but for the validators of the block), then every time you enter your passphrase and the name of the website, a request to the blockchain (through infura.io, the only request made by Pure PM) is made to read the format for your password.

To be really secure, your passphrase have to be long, but it is the only thing you have to remember then to sign in to any website.

The smart contract in the ethereum blockchain is just a mapping taking
a hash of the hash of your passphrase (not directly the hash of your passphrase
since that's what is used to generate the password) associated with the corresponding format.

## Schema

```
-------------------   ---------------------------
| Your passphrase |   | The name of the website |
-------------------   ---------------------------
              ║           ║              ║
              V           V              ║
           Hashed with scrypt            ║
                   ║                     ║
                   V                     ║
          -------------------            ║
          | Password Source |═════╗      ║
          -------------------     ║      ║
                   ║              V      V
                   ║         Hashed with scrypt
                   ║                  ║
                   ║                  V
                   ║           --------------
                   ║           | Format Key |
                   ║           --------------
                   ║                  ║
                   ║                  V
                   ║          Search Format in the blockchain
                   ║          using Format Key.
                   ║          if not found, use Format = "12 alphanumeric"
                   ║                  ║
                   ║                  V
                   ║             ----------
                   ║             | Format | <- You can change it to generate
                   ║             ----------    another password. When saved
                   ║                  ║        to the blockchain, 'Format' is
                   ║  ╔═══════════════╝        associated with 'Format Key'
                   V  V
            Password Generator
                    ║  
                    V
              ------------
              | Password |
              ------------


```

The options for scrypt are found in config.js :
```js
{
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
  }
}
```
An additionnal salt (`pure-formatHash-salt|`) is prefixed to the website
name when hashing the password source to obtain the Format Key.

All those options should not change but this is still an experimental application
running in the Ropsten testnet. Once we move to the MainNet all this will be freezed.

### Author
Quentin Bramas <bramas@unistra.fr>

### Licence
MIT

### Donation
ETH: 0x1Bcae562115A3bE1336FE2761647BBf0Ceb9574a
