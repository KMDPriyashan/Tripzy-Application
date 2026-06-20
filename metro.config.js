const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'cjs');
config.resolver.sourceExts = config.resolver.sourceExts || [];
config.resolver.sourceExts.push('cjs');

module.exports = config;