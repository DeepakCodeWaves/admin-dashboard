module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ["eslint:recommended", "plugin:jest/recommended"], // ✅ Adds Jest plugin
  plugins: ["jest"], // ✅ Include Jest plugin
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    // Add custom ESLint rules here
  },
};
