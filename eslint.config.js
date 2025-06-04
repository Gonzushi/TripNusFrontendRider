// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    extends: ["expo", "prettier"],
    ignorePatterns: ["/dist/*"],
    plugins: ["prettier"],
    rules: {
      "prettier/prettier": "error",
      "import/no-unresolved": "off",
    },
  },
]);
