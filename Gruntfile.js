'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    mochaTest: {
      test: {
        options: { reporter: 'spec' },
        src: ['test/**/*.js']
      }
    },
    jshint: {
      all: ['*.js', 'test/**/*.js', 'arduinoTest/**/*.js'],
      options:{
        jshintrc: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('default', ['jshint', 'mochaTest']);

};
