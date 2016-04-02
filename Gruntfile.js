'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    mochaTest: {
      test: {
        options: { reporter: 'spec' },
        src: ['test/*.js']
      }
    },
    eslint: {
      src: [
        '*.js',
        'test/**/*.js',
        'test_mocks/**/*.js',
        'arduinoTest/**/*.js',
        'bin/*.js'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('gruntify-eslint');
  grunt.registerTask('lint', ['eslint']);
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('default', ['lint', 'test']);
};
