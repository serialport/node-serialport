// Mocks fs.read for listLinux

'use strict';

var proxyquire =  require('proxyquire');

var mockPorts = {};
var characterDevice = true;
var error = false;

var listLinux = proxyquire('../../lib/list-linux', {
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
});

listLinux.setCharacterDevice = function(isCharacterDevice) {
  characterDevice = isCharacterDevice;
};

listLinux.setPorts = function(ports) {
  mockPorts = ports;
};

listLinux.error = function(err) {
  error = err;
};

listLinux.reset = function() {
  error = false;
  mockPorts = {};
  characterDevice = true;
};

module.exports = listLinux;
