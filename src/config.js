

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
  scryptSaltPrefix: 'pure-salt|'
}
