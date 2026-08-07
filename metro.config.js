const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const { withSentryConfig } = require("@sentry/react-native/metro");

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    // Spreading the default transformer keeps React Native 0.83's own
    // `getTransformOptions`, which already returns `inlineRequires: true`
    // (see @react-native/metro-config/dist/index.js). Audit finding P-05 asked
    // for inline-requires to be enabled; it is on for every bundle we produce.
    // Do not replace this spread with a bare object — that silently drops
    // inline-requires and puts ~200-400ms back on TTI.
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
  resolver: {
    ...defaultConfig.resolver,
    assetExts: defaultConfig.resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...defaultConfig.resolver.sourceExts, "svg"],
  },
};

module.exports = withSentryConfig(mergeConfig(defaultConfig, config));