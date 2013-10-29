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
      options: {
        node: true,
        '-W030': true, // to allow mocha expects syntax
        globals: {
          before: false,
          after: false,
          beforeEach: false,
          afterEach: false,
          describe: false,
          it: false
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('default', ['jshint', 'mochaTest']);

};