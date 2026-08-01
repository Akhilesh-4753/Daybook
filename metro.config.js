try {
  require('./scripts/recolor.js');
} catch (e) {
  console.warn('Recolor script notice:', e.message);
}

const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push('wasm');

module.exports = defaultConfig;
