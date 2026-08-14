/**
 * The clipboard is a native module and cannot load under Jest.
 *
 * This is a STATEFUL fake pasteboard, not a pair of jest.fn() stubs, for the
 * same reason __mocks__/react-native-quick-crypto.js maps onto Node's real
 * crypto: the thing under test (copyEphemeral, M-05 / N-05) is about what the
 * clipboard *contains* over time, and specifically about a read-compare-write
 * sequence. Call-count assertions against inert stubs would happily pass a
 * "cleared" test that never cleared anything.
 *
 * getString() returns a Promise to match the real API; setString() is sync.
 */

let contents = '';

const Clipboard = {
  setString: jest.fn((text) => {
    contents = String(text);
  }),
  getString: jest.fn(() => Promise.resolve(contents)),

  // Test helpers — not part of the real module's surface.
  __setContents: (text) => {
    contents = String(text);
  },
  __getContents: () => contents,
  __reset: () => {
    contents = '';
  },
};

module.exports = Clipboard;
module.exports.default = Clipboard;
module.exports.__esModule = true;
