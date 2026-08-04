module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./src"],
        extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
        alias: {
          utils: "./src/utils",
          screens: "./src/screens",
          navigation: "./src/navigation",
          hooks: "./src/hooks",
          components: "./src/components",
          assets: "./src/assets",
          constants: "./src/constants",
          configs: "./src/configs",
        },
      },
    ],
    // Must stay LAST in this array — react-native-worklets rewrites function
    // bodies and has to see them after every other transform has run.
    "react-native-worklets/plugin",
  ],
  env: {
    // Security finding M-16. Hermes does not strip console output from release
    // bundles: it reaches logcat / os_log verbatim. Metro sets BABEL_ENV to
    // "production" for any non-dev bundle, so this drops every console.* call —
    // ours and third-party — from what ships.
    //
    // No `exclude` list: console.error and console.warn leak exactly as readily
    // as console.log, and error reporting now goes through src/utils/logger.ts
    // to Sentry and Crashlytics instead, so nothing diagnostic is lost.
    //
    // Declared under env rather than appended to the plugins array above so it
    // cannot displace react-native-worklets/plugin from the end of that list.
    production: {
      plugins: ["transform-remove-console"],
    },
  },
};
