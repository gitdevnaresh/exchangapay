const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const path = require("path");

const { withSentryConfig } = require("@sentry/react-native/metro");

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
  resolver: {
    ...defaultConfig.resolver,
    assetExts: defaultConfig.resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...defaultConfig.resolver.sourceExts, "svg"],
    extraNodeModules: {
      events: path.resolve(__dirname, "shims/events.js"),
      "node:events": path.resolve(__dirname, "shims/events.js"),
      "react-native-reanimated-carousel": path.resolve(
        __dirname,
        "shims/reactNativeReanimatedCarousel.js"
      ),
    },
  },
};

module.exports = withSentryConfig(mergeConfig(defaultConfig, config));
