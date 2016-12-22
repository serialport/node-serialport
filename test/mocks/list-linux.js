// Mocks fs.read for listLinux

'use strict';

const proxyquire = require('proxyquire');

let mockPorts = {};
let characterDevice = true;
let error = false;

const listLinux = proxyquire('../../lib/list-linux', {
  fs: {
    readdir(path, cb) {
      if (error) {
        return process.nextTick(function() {
          cb(new Error('Bad'));
        });
      }
      process.nextTick(function() {
        cb(null, Object.keys(mockPorts));
      });
    },
    stat(path, cb) {
      process.nextTick(function() {
        cb(null, { isCharacterDevice() { return characterDevice } });
      });
    }
  },
  path: {
    // needed for testing on windows
    join() {
      return Array.prototype.join.call(arguments, '/');
    }
  },
  child_process: {
    exec(cmd, cb) {
      const port = cmd.split(/\/dev\/(.*)\)/)[1];
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
