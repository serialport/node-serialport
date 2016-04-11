'use strict';
var cp = require('child_process');

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
        'lib/**/*.js',
        'test/**/*.js',
        'bin/**/*.js',
        'examples/**/*.js'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('gruntify-eslint');
  grunt.registerTask('lint', ['eslint']);
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('default', ['lint', 'test']);

  grunt.registerTask('changelog', '`changelog:0.0.0--0.0.2` or `changelog`', function(range) {
    var done = this.async();

    if (!range) {
      // grunt changelog
      range = cp.execSync('git tag --sort version:refname').toString().split('\n');
    } else {
      // grunt changelog:previous--present
      range = range.split('--');
    }

    range = range.filter(Boolean).reverse();

    // One day, it would be ideal to use:
    // `git log --format='|%h|%s|' ${range[1]}..${range[0]}`
    cp.exec('git log --format="|%h|%s|" ' + range[1] + '..' + range[0], function(error, result) {
      if (error) {
        console.log(error.message);
        return;
      }

      var rows = result.split('\n').filter(function(commit) {
        return !commit.includes('|Merge ') && !commit.includes(range[0]);
      }).join('\n');

      // Extra whitespace above and below makes it easier to quickly copy/paste from terminal
      grunt.log.writeln('\n\n' + changelog(rows) + '\n\n');

      done();
    });
  });
};

function changelog(rows) {
  return [
    '| Commit | Message/Description |\n',
    '| ------ | ------------------- |\n',
    rows
  ].join('');
}

