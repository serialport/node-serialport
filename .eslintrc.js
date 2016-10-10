module.exports = {
  env: {
    node: true,
    mocha: true,
  },
  parserOptions: {
    sourceType: "script"
  },
  globals: {
    "Promise": false
  },
  rules: {
    "brace-style": [2, "1tbs", {"allowSingleLine": true} ],
    "complexity": [2, 13],
    "curly": 2,
    "eqeqeq": 2,
    "indent": [2, 2, {
      SwitchCase: 1
    }],
    "max-depth": 2,
    "max-statements": [2, 36],
    "new-cap": 2,
    "no-caller": 2,
    "no-cond-assign": 2,
    "no-else-return": 2,
    "no-undef": 2,
    "no-unused-vars": [2, { "args": "after-used" }],
    "no-use-before-define": 2,
    "padded-blocks": [2, "never"],
    "quotes": [2, "single", "avoid-escape"],
    "semi": [2, "always", {"omitLastInOneLineBlock": true }],
    "space-before-blocks": [2, "always"],
    "space-before-function-paren": [2, "never"],
    "strict": 2,
    "wrap-iife": [2, "inside"]
  }
};
