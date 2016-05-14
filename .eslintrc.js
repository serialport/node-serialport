module.exports = {
  env: {
    node: true,
    mocha: true,
  },
  parserOptions: {
    sourceType: "script"
  },
  rules: {
    "brace-style": [2, "1tbs", {"allowSingleLine": true} ],
    "complexity": [2, 32],
    "curly": 2,
    "eqeqeq": 2,
    "max-depth": 2,
    "max-statements": [2, 41],
    "new-cap": 2,
    "no-caller": 2,
    "no-cond-assign": 2,
    "no-else-return": 2,
    "no-unused-vars": [2, { "args": "after-used" }],
    "no-use-before-define": 2,
    "quotes": [2, "single", "avoid-escape"],
    "semi": [2, "always", {"omitLastInOneLineBlock": true }],
    "space-before-function-paren": [2, "never"],
    "strict": 2,
    "wrap-iife": [2, "inside"]
  }
};
