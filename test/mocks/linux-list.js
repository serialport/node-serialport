// Mocks fs.read for listLinux

'use strict';

const proxyquire = require('proxyquire');

let mockPorts;
let error = false;

proxyquire.noPreserveCache();
const listLinux = proxyquire('../../lib/bindings/linux-list', {
  child_process: {
    spawn(cmd, cb) {
      const EventEmitter = require('events');
      let event = new EventEmitter();
      const Readable = require('stream').Readable
      var stream = new Readable;
      stream.push(mockPorts);
      stream.push(null);
      event.stdout = stream;
      return event;
    }
  }
});

proxyquire.preserveCache();

listLinux.setPorts = (ports) => {
  mockPorts = ports;
};

listLinux.error = (err) => {
  error = err;
};

listLinux.reset = () => {
  error = false;
  mockPorts = {};
};

module.exports = listLinux;
