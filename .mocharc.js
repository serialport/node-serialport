'use strict';

module.exports = {
  bail: true,
  require: [
    'esbuild-register'
  ],
  'spec': ['packages/**/*.test.js', 'packages/**/*.test.ts'],
}
