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
      // Plugin per carregar variables d’entorn des de .env
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          allowUndefined: false  // Si vols que peti si falta alguna variable
        }
      ],

      // Reanimated com a plugin
      "react-native-reanimated/plugin"
    ],
  };
};
