module.exports = {
  extends: ['eslint:recommended', 'plugin:node/recommended', 'plugin:mocha/recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['node', 'mocha', '@typescript-eslint'],
  env: {
    node: true,
    mocha: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 12,
  },
  globals: {
    assert: false,
    makeTestFeature: false,
    shouldReject: false,
  },
  rules: {
    'no-extra-semi': 'off', //prettier does this
    '@typescript-eslint/no-extra-semi': 'off', //prettier does this
    'no-process-exit': 'off',
    'no-var': 'error',
    'node/no-extraneous-import': [
      'error',
      {
        allowModules: ['sinon', 'chai'], //this gets pulled from monorepo root where the tests are run
      },
    ],
    'node/no-missing-import': 'off',
    'node/no-missing-require': 'off',
    'node/no-unpublished-import': 'off',
    'node/no-unpublished-require': 'off',
    'node/no-unsupported-features/es-builtins': 'error',
    'node/no-unsupported-features/es-syntax': 'off',
    'node/no-unsupported-features/node-builtins': 'error',
    'node/shebang': 'off',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-template': 'error',
    'mocha/no-exclusive-tests': 'error',
    'mocha/no-hooks-for-single-case': 'off',
    'mocha/no-mocha-arrows': 'off',
    'mocha/no-pending-tests': 'error',
    'mocha/no-setup-in-describe': 'off',
    strict: ['error', 'never'],
    'valid-jsdoc': 'off',
    '@typescript-eslint/no-var-requires': 'off', // until we get all js ported over
    '@typescript-eslint/no-empty-function': 'off',
  },
}
