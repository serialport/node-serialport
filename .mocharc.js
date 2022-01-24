'use strict';

module.exports = {
  bail: true,
  require: [
    'esbuild-register',
    './test/initializers'
  ],
  'spec': ['packages/**/*.test.js'],
}
