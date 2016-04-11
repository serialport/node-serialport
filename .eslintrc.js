module.exports = {
  extends: "standard",
  env: {
    node: true,
    mocha: true,
  },
  plugins: [
      "standard"
  ],
  parserOptions: {
    sourceType: "script"
  },
  rules: {
    "eqeqeq": 2,
    "no-use-before-define": 2,
    "no-caller": 2,
    "max-depth": 2,
    "complexity": [2, 32],
    "max-statements": [2, 41],
    "no-else-return": 2, // maybe
    "wrap-iife": [2, "inside"],
    "new-cap": 2,
    "strict": 2,
    "curly": 2,
    "quotes": [2, "single", "avoid-escape"],
    "brace-style": 2,
    "no-unused-vars": [2, { "args": "after-used" }],
    "space-before-function-paren": 0,
    "semi": [2, "always", {
      "omitLastInOneLineBlock": true
    }]
  }
};
