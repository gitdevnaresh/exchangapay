/**
 * The RN Buffer shim re-implements Buffer in JS. Under Jest we already have the
 * real Node Buffer, and passing a foreign Buffer-alike into node:crypto (see
 * __mocks__/react-native-quick-crypto.js) is a needless source of type friction.
 */

module.exports = { Buffer: global.Buffer };
module.exports.__esModule = true;
