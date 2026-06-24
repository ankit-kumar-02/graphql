const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force Metro to use the CJS build of tslib instead of the ESM build.
// Without this, Apollo Client v4 crashes with:
//   "Cannot destructure property '__extends' of 'tslib.default' as it is undefined"
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/tslib/tslib.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
