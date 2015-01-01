'use strict';
module.exports = function(grunt) {

  require('jit-grunt')(grunt, {});

  grunt.initConfig({
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          clearRequireCache: true
        },
        src: ['test/**/*.js']
      }
    },
    jshint: {
      all: ['*.js', 'transforms/*.js', 'test/**/*.js', 'arduinoTest/**/*.js'],
      options: {
        jshintrc: true
      }
    },
    watch: {
      javascripts: {
        options: {
          spawn: false
        },
        files: [ '*.js', 'transforms/*.js', 'test/**/*.js' ],
        tasks: ['jshint', 'mochaTest']
      }
    }
  });
    
  // On watch events, if the changed file is a test file then configure mochaTest to only
  // run the tests from that file. Otherwise run all the tests
  var defaultTestSrc = grunt.config('mochaTest.test.src');
  grunt.event.on('watch', function(action, filepath) {
    if (filepath.match('test/')) {
      grunt.config('mochaTest.test.src', ['test/global.js', filepath]);
    } else {
      grunt.config('mochaTest.test.src', defaultTestSrc);
    }
  });

  grunt.registerTask('default', ['jshint', 'mochaTest']);
};
