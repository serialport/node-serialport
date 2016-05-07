// Mocks fs.read for listUnix

'use strict';

var SandboxedModule = require('sandboxed-module');

var mockPorts = {};
var characterDevice = true;
var error = false;

var listUnix = SandboxedModule.require('../../lib/list-unix', {
  requires: {
    fs: {
      readdir: function(path, cb) {
        if (error) {
          return process.nextTick(function() {
            cb(new Error('bad'));
          });
        }
        process.nextTick(function() {
          cb(null, Object.keys(mockPorts));
        });
      },
      stat: function(path, cb) {
        process.nextTick(function() {
          cb(null, { isCharacterDevice: function() { return characterDevice } });
        });
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

listUnix.setCharacterDevice = function(isCharacterDevice) {
  characterDevice = isCharacterDevice;
};

listUnix.setPorts = function(ports) {
  mockPorts = ports;
};

listUnix.error = function(err) {
  error = err;
};

listUnix.reset = function() {
  error = false;
  mockPorts = {};
  characterDevice = true;
};

module.exports = listUnix;
