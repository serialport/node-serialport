'use strict';
module.exports = function(grunt) {

  require('jit-grunt')(grunt, {});

  grunt.initConfig({
    mochaTest: {
      test: {
        options: { reporter: 'spec' },
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
        files: [ '*.js', 'transforms/*.js', 'test/**/*.js' ],
        tasks: ['jshint', 'mochaTest']
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'mochaTest']);
};
