// Mocks fs.read for listUnix

'use strict';

var SandboxedModule = require('sandboxed-module');

var mockPorts = {};

var listUnix = SandboxedModule.require('../lib/list-unix', {
  requires: {
    fs: {
      readdir: function(path, cb) {
        process.nextTick(function() {
          cb(null, Object.keys(mockPorts));
        });
      },
      statSync: function() {
        return { isCharacterDevice: function() { return true } };
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

module.exports = listUnix;
