import nodePlugin from 'eslint-plugin-n'
import mocha from 'eslint-plugin-mocha'
import globals from 'globals'
import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslint from '@eslint/js'
import typescriptEslint from 'typescript-eslint'

export default [
  {
    ignores: ['packages/*/node_modules', '**/docs', 'packages/*/dist/*'],
  },
  js.configs.recommended,
  nodePlugin.configs['flat/recommended-script'],
  mocha.configs['flat'].recommended,
  ...typescriptEslint.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
        assert: false,
        makeTestFeature: false,
        shouldReject: false,
      },
      ecmaVersion: 12,
      sourceType: 'commonjs',
    },

    rules: {
      'no-extra-semi': 'off',
      '@typescript-eslint/no-extra-semi': 'off',
      'n/no-process-exit': 'off',
      'no-var': 'error',

      'n/no-extraneous-import': [
        'error',
        {
          allowModules: ['sinon', 'chai'],
        },
      ],

      'n/no-missing-import': 'off',
      'n/no-missing-require': 'off',
      'n/no-unpublished-import': 'off',
      'n/no-unpublished-require': 'off',
      'n/no-unsupported-features/es-builtins': 'error',
      'n/no-unsupported-features/es-syntax': 'off',
      'n/no-unsupported-features/node-builtins': 'error',
      'n/hashbang': 'off',
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
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]
