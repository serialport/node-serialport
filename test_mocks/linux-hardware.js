// This takes a serial-port factory and mocks the shit out of it in complete isolation per require of this file

"use strict";

var mockSerialportPoller = function (hardware) {
  var Poller = function (fd, cb) {
    this.port = hardware.fds[fd];
    if (!this.port) {
      throw new Error(fd + " does not exist - please call hardware.createPort(path) first");
    }
    this.port.poller = this;
    this.polling = null;
    this.cb = cb;
  };
  Poller.prototype.start = function () {
    this.polling = true;
  };
  Poller.prototype.close = function () {
    this.polling = false;
  };
  Poller.prototype.detectRead = function () {
    this.cb();
  };
  return Poller;
};

var Hardware = function () {
  // We start at 1 because there are bugs when the fd is 0
  this.nextFd = 1;
  this.fds = {};
  this.ports = {};
  this.mockBinding = {
    list: this.list.bind(this),
    open: this.open.bind(this),
    write: this.write.bind(this),
    close: this.close.bind(this),
    flush: this.flush.bind(this),
    SerialportPoller: mockSerialportPoller(this)
  };
};

Hardware.prototype.reset = function () {
  this.ports = {};
  this.fds = {};
  // TODO Change to zero once 0-fd bug is fixed
  this.nextFd = 1;
};

Hardware.prototype.createPort = function (path) {
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

Hardware.prototype.emitData = function (path, data) {
  var port = this.ports[path];
  if(!port) {
    throw new Error(path + " does not exist - please call hardware.createPort(path) first");
  }
  port.data = Buffer.concat([port.data, data]);
  port.poller && port.poller.detectRead();
};

Hardware.prototype.disconnect = function (path) {
  var port = this.ports[path];
  if (!port) {
    throw new Error(path + " does not exist - please call hardware.createPort(path) first");
  }
  port.openOpt.disconnectedCallback();
};

Hardware.prototype.list = function (cb) {
  var ports = this.ports;
  var info = Object.keys(ports).map(function (path) {
    return ports[path].info;
  });
  cb && cb(info);
};

Hardware.prototype.open = function (path, opt, cb) {
  var port = this.ports[path];
  if (!port) {
    return cb(new Error(path + " does not exist - please call hardware.createPort(path) first"));
  }
  port.open = true;
  port.openOpt = opt;
  cb && cb(null, port.fd);
};

Hardware.prototype.write = function (fd, buffer, cb) {
  var port = this.fds[fd];
  if (!port) {
    return cb(new Error(fd + " does not exist - please call hardware.createPort(path) first"));
  }
  port.lastWrite = new Buffer(buffer); //copy
  cb && cb(null, buffer.length);
};

Hardware.prototype.close = function (fd, cb) {
  var port = this.fds[fd];
  if (!port) {
    return cb(new Error(fd + " does not exist - please call hardware.createPort(path) first"));
  }
  port.open = false;
  cb && cb(null);
};

Hardware.prototype.flush = function (fd, cb) {
  var port = this.fds[fd];
  if (!port) {
    return cb(new Error(fd + " does not exist - please call hardware.createPort(path) first"));
  }
  cb && cb(null, undefined);
};

Hardware.prototype.fakeRead = function (fd, buffer, offset, length, position, cb) {
  var port = this.fds[fd];
  if (!port) {
    return cb(new Error(fd + " does not exist - please call hardware.createPort(path) first"));
  }
  if (port.data.length === 0) {
    return cb(null, 0, buffer);
  }
  if ((offset + length) > buffer.length) {
    throw new Error("Length extends beyond buffer");
  }

  // node v0.8 doesn't like a slice that is bigger then available data
  length = port.data.length < length ? port.data.length : length;
  var read = port.data.slice(0, length);
  port.data = port.data.slice(length);
  read.copy(buffer, offset);
  cb(null, read.length, buffer);
};

var hardware = new Hardware();

var SandboxedModule = require('sandboxed-module');

var serialPort = SandboxedModule.require('../serialport', {
  requires: {
    fs: {
      read: hardware.fakeRead.bind(hardware)
    }
  },
  globals: {
    process: {
      platform: 'darwin',
      nextTick: process.nextTick
    }
  }
});

serialPort.hardware = hardware;
serialPort.SerialPortBinding = hardware.mockBinding;

module.exports = serialPort;
