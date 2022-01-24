module.exports = {
  "extends": [
    "eslint:recommended",
    "plugin:node/recommended",
    "plugin:mocha/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "prettier",
    "node",
    "mocha",
    "@typescript-eslint",
  ],
  "env": {
    "node": true,
    "mocha": true,
    "es6": true
  },
  "parserOptions": {
    "ecmaVersion": 12,
  },
  "globals": {
    "assert": false,
    "makeTestFeature": false,
    "shouldReject": false
  },
  "rules": {
    "no-extra-semi": "off",
    "no-process-exit": "off",
    "no-var": "error",
    "node/no-extraneous-require": "off",
    "node/no-missing-import": "off",
    "node/no-missing-require": "off",
    "node/no-unpublished-import": "off",
    "node/no-unpublished-require": "off",
    "node/no-unsupported-features/es-builtins": "error",
    "node/no-unsupported-features/es-syntax": "off",
    "node/no-unsupported-features/node-builtins": "error",
    "node/shebang": "off",
    "object-shorthand": "error",
    "prefer-arrow-callback": "error",
    "prefer-const": "error",
    "prefer-template": "error",
    "prettier/prettier": [
      "error",
      {
        "singleQuote": true,
        "trailingComma": "es5",
        "semi": false,
        "printWidth": 150,
        "arrowParens": "avoid"
      }
    ],
    "mocha/no-exclusive-tests": "error",
    "mocha/no-hooks-for-single-case": "off",
    "mocha/no-mocha-arrows": "off",
    "mocha/no-pending-tests": "error",
    "mocha/no-setup-in-describe": "off",
    "strict": ["error", "never"],
    "valid-jsdoc": "off",
    "@typescript-eslint/no-var-requires": "off", // until we get all js ported over
    "@typescript-eslint/no-empty-function": "off",
  }
}
