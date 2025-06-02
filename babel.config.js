
// babel.config.js

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // El preset d’Expo amb jsxImportSource perquè NativeWind funcioni
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      
      
      // Reanimated com a plugin
      "react-native-reanimated/plugin"
    ],
  };
};
