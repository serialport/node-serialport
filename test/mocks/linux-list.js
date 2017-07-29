// Mocks fs.read for listLinux

'use strict';

const proxyquire = require('proxyquire');

let mockPorts;

proxyquire.noPreserveCache();
const listLinux = proxyquire('../../dist/bindings/linux-list', {
  child_process: {
    spawn() {
      const EventEmitter = require('events');
      const event = new EventEmitter();
      const Readable = require('stream').Readable;
      const stream = new Readable();
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

listLinux.reset = () => {
  mockPorts = {};
};

module.exports = listLinux;
