module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["css-modules", "@typescript-eslint", "unused-imports"],
    extends: ["plugin:@typescript-eslint/recommended"],
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "css-modules/no-unused-class": "warn",
        "css-modules/no-undef-class": "error",
    },
    settings: {
        "css-modules": {
          basePath: "src",
        },
    },
};  