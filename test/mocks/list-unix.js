// Mocks fs.read for listUnix

'use strict';

var SandboxedModule = require('sandboxed-module');

var mockPorts = {};
var error = false;

var listUnix = SandboxedModule.require('../../lib/list-unix', {
  requires: {
    fs: {
      readdir: function(path, cb) {
        if (error) {
          return process.nextTick(cb.bind(null, new Error('bad')));
        }
        process.nextTick(cb.bind(null, null, Object.keys(mockPorts)));
      },
      statSync: function() {
        return { isCharacterDevice: function() { return true } };
      }
    },
    path: {
      // needed for testing on windows
      join: function() {
        return Array.prototype.join.call(arguments, '/');
      }
    },
    child_process: {
      exec: function(cmd, cb) {
        var port = cmd.split(/\/dev\/(.*)\)/)[1];
        process.nextTick(function() {
          cb(null, mockPorts[port]);
        });
      }
    }
  }
});

listUnix.setPorts = function(ports) {
  mockPorts = ports;
};

listUnix.error = function(err) {
  error = err;
};

listUnix.reset = function() {
  error = false;
  mockPorts = {};
};

module.exports = listUnix;
