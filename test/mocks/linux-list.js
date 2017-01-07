// Mocks fs.read for listLinux

'use strict';

const proxyquire = require('proxyquire');

let mockPorts = {};
let characterDevice = true;
let error = false;

proxyquire.noPreserveCache();
const listLinux = proxyquire('../../lib/bindings/linux-list', {
  fs: {
    readdir(path, cb) {
      if (error) {
        return process.nextTick(() => cb(new Error('Bad')));
      }
      process.nextTick(() => cb(null, Object.keys(mockPorts)));
    },
    stat(path, cb) {
      process.nextTick(() => cb(null, { isCharacterDevice() { return characterDevice } }));
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
      process.nextTick(() => cb(null, mockPorts[port]));
    }
  }
});

proxyquire.preserveCache();

listLinux.setCharacterDevice = (isCharacterDevice) => {
  characterDevice = isCharacterDevice;
};

listLinux.setPorts = (ports) => {
  mockPorts = ports;
};

listLinux.error = (err) => {
  error = err;
};

listLinux.reset = () => {
  error = false;
  mockPorts = {};
  characterDevice = true;
};

module.exports = listLinux;
