/**
 * QuickCrypto is a native module and cannot load under Jest.
 *
 * Rather than stubbing it out, this maps it onto Node's own `crypto`. The two
 * APIs are the same shape by design (QuickCrypto is a drop-in for node:crypto),
 * and both are OpenSSL underneath, so the crypto tests run REAL AES against REAL
 * GCM tags. A hand-rolled fake would happily "pass" a tamper test it never
 * actually performed, which for this suite would be worse than no test at all.
 */

const crypto = require('crypto');

const QuickCrypto = {
  randomBytes: (size) => crypto.randomBytes(size),
  createCipheriv: (algorithm, key, iv, options) =>
    crypto.createCipheriv(algorithm, key, iv, options),
  createDecipheriv: (algorithm, key, iv, options) =>
    crypto.createDecipheriv(algorithm, key, iv, options),
  createHash: (algorithm) => crypto.createHash(algorithm),
  createHmac: (algorithm, key) => crypto.createHmac(algorithm, key),
};

module.exports = QuickCrypto;
module.exports.default = QuickCrypto;
module.exports.__esModule = true;
