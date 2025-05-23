const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname)

config.resolver.unstable_enablePackageExports = false; //problema con el error node_modules/ws/lib/stream.js.... quan conecto a supabawe

module.exports = withNativeWind(config, { input: './global.css' })