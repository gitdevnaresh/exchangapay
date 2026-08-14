/**
 * Security findings M-16 and L-06.
 *
 * `package.json` has shipped a `lint` script and an ESLint dependency for the
 * life of the project with no config file for either to use, so `eslint .`
 * linted nothing. This is the minimum config that makes the script real and
 * enforces the one rule the console-logging finding turns on.
 *
 * Scope is deliberately narrow. L-06 also recommends type-aware rules
 * (`no-floating-promises`, `no-misused-promises`, `no-explicit-any`); those
 * need `parserOptions.project` and will surface a large existing backlog —
 * introduce them separately so this file does not become a blocked CI gate on
 * day one.
 */
module.exports = {
  root: true,
  extends: "@react-native",
  rules: {
    // M-16: nothing may call console directly. Logging goes through
    // src/utils/logger.ts, which gates on __DEV__ and redacts structured data.
    "no-console": "error",

    // M-05 / N-05: every clipboard write must auto-clear. Both the deprecated
    // core `Clipboard` and the community module bypass the TTL, so neither may
    // be imported outside src/utils/clipboard.ts.
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "react-native",
            importNames: ["Clipboard"],
            message:
              "Use copyEphemeral from src/utils/clipboard.ts — clipboard writes must auto-clear (M-05, N-05).",
          },
          {
            name: "@react-native-clipboard/clipboard",
            message:
              "Use copyEphemeral from src/utils/clipboard.ts — clipboard writes must auto-clear (M-05, N-05).",
          },
        ],
      },
    ],
  },
  overrides: [
    {
      // The one module allowed to touch console — its calls are __DEV__-gated
      // and stripped from release bundles by transform-remove-console anyway.
      files: ["src/utils/logger.ts"],
      rules: { "no-console": "off" },
    },
    {
      // clipboard.ts is the one module allowed to touch the clipboard directly
      // — it is what applies the TTL. Tests need the same access to assert
      // against the fake pasteboard in __mocks__.
      files: ["src/utils/clipboard.ts", "src/**/__tests__/**"],
      rules: { "no-restricted-imports": "off" },
    },
  ],
  ignorePatterns: [
    "node_modules/",
    "android/",
    "ios/",
    "vendor/",
    "patches/",
    "*.config.js",
  ],
};
