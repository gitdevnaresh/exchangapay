module.exports = {
  project: {
    ios: {},
    android: {},
  },
  dependencies: {
    "react-native-flipper": {
      platforms: {
        ios: null,
      },
    },
    'react-native-permissions': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-permissions/android',
          packageImportPath: 'import io.github.zoontek.rnpermissions.RNPermissionsPackage;',
        },
      },
    },
  },
  assets: ["./src/assets/fonts"],
};