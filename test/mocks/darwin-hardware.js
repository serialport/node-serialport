// This takes a serial-port factory and mocks it in complete isolation

'use strict';

function callLater() {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.shift();
  process.nextTick(function() {
    callback && callback.apply(null, args);
  });
}

var mockSerialportPoller = function(hardware) {
  var Poller = function(fd, cb) {
    this.port = hardware.fds[fd];
    if (!this.port) {
      throw new Error(fd + ' does not exist - please call hardware.createPort(path) first');
    }
    this.port.poller = this;
    this.polling = null;
    this.cb = cb;
  };
  Poller.prototype.start = function() {
    this.polling = true;
  };
  Poller.prototype.close = function() {
    this.polling = false;
  };
  Poller.prototype.detectRead = function() {
    this.cb();
  };
  return Poller;
};

var Hardware = function() {
  this.nextFd = 0;
  this.fds = {};
  this.ports = {};
  this.mockBinding = {
    close: this.close.bind(this),
    drain: this.drain.bind(this),
    flush: this.flush.bind(this),
    list: this.list.bind(this),
    open: this.open.bind(this),
    SerialportPoller: mockSerialportPoller(this),
    set: this.set.bind(this),
    update: this.update.bind(this),
    write: this.write.bind(this)
  };
};

Hardware.prototype.reset = function() {
  this.ports = {};
  this.fds = {};
  this.nextFd = 0;
};

Hardware.prototype.createPort = function(path) {
  if (this.ports[path]) {
    delete this.fds[this.ports[path].fd];
  }
  var fd = this.nextFd++;
  this.ports[path] = {
    data: new Buffer(0),
    lastWrite: null,
    open: false,
    poller: null,
    info: {
      comName: path,
      manufacturer: '',
      serialNumber: '',
      pnpId: '',
      locationId: '',
      vendorId: '',
      productId: ''
    },
    fd: fd
  };
  this.fds[fd] = this.ports[path];
};

Hardware.prototype.emitData = function(path, data) {
  var port = this.ports[path];
  if (!port) {
    throw new Error(path + ' does not exist - please call hardware.createPort(path) first');
  }
  port.data = Buffer.concat([port.data, data]);
  port.poller && port.poller.detectRead();
};

Hardware.prototype.disconnect = function(path) {
  var port = this.ports[path];
  if (!port) {
    throw new Error(path + ' does not exist - please call hardware.createPort(path) first');
  }
  port.openOpt.disconnectedCallback && port.openOpt.disconnectedCallback();
};

Hardware.prototype.list = function(cb) {
  var ports = this.ports;
  var info = Object.keys(ports).map(function(path) {
    return ports[path].info;
  });
  callLater(cb, null, info);
};

Hardware.prototype.open = function(path, opt, cb) {
  var port = this.ports[path];
  if (!port) {
    return cb(new Error(path + ' does not exist - please call hardware.createPort(path) first'));
  }
  port.open = true;
  port.openOpt = opt;
  callLater(cb, null, port.fd);
};

Hardware.prototype.update = function(fd, opt, cb) {
  var port = this.fds[fd];
  if (!port) {
    return cb(new Error(fd + ' does not exist - please call hardware.createPort(path) first'));
  }
  callLater(cb, null);
};

Hardware.prototype.write = function(fd, buffer, cb) {
  var port = this.fds[fd];
  if (!port) {
    return cb(new Error(fd + ' does not exist - please call hardware.createPort(path) first'));
  }
  port.lastWrite = new Buffer(buffer); // copy
  callLater(cb, null, buffer.length);
};

Hardware.prototype.close = function(fd, cb) {
  var port = this.fds[fd];
  if (!port) {
    return cb(new Error(fd + ' does not exist - please call hardware.createPort(path) first'));
  }
  if (!port.open) {
    return cb(new Error(fd + ' fd is already closed'));
  }
  port.open = false;
  callLater(cb, null);
};

Hardware.prototype.flush = function(fd, cb) {
  var port = this.fds[fd];
  if (!port) {
    return cb(new Error(fd + ' does not exist - please call hardware.createPort(path) first'));
  }
  callLater(cb, null, undefined);
};

Hardware.prototype.set = function(fd, options, cb) {
  var port = this.fds[fd];
  if (!port) {
    return cb(new Error(fd + ' does not exist - please call hardware.createPort(path) first'));
  }
  callLater(cb, null, undefined);
};

Hardware.prototype.drain = function(fd, cb) {
  var port = this.fds[fd];
  if (!port) {
    return cb(new Error(fd + ' does not exist - please call hardware.createPort(path) first'));
  }
  callLater(cb, null, undefined);
};

Hardware.prototype.fakeRead = function(fd, buffer, offset, length, position, cb) {
  var port = this.fds[fd];
  if (!port) {
    return cb(new Error(fd + ' does not exist - please call hardware.createPort(path) first'));
  }
  if (port.data.length === 0) {
    return cb(null, 0, buffer);
  }
  if ((offset + length) > buffer.length) {
    throw new Error('Length extends beyond buffer');
  }

  // node v0.8 doesn't like a slice that is bigger then available data
  length = port.data.length < length ? port.data.length : length;
  var read = port.data.slice(0, length);
  port.data = port.data.slice(length);
  read.copy(buffer, offset);
  callLater(cb, null, read.length, buffer);
};

var hardware = new Hardware();

var SandboxedModule = require('sandboxed-module');

var serialPort = SandboxedModule.require('../../', {
  requires: {
    fs: {
      read: hardware.fakeRead.bind(hardware)
    },
    './bindings': hardware.mockBinding
  },
  singleOnly: true,
  globals: {
    process: {
      platform: 'darwin',
      nextTick: process.nextTick
    }
  }
});

serialPort.hardware = hardware;

module.exports = serialPort;
