'use strict';

var inherits = require('util').inherits;
var processNextTick = function() {
  var args = Array.prototype.slice.apply(arguments);
  var cb = args.shift();
  process.nextTick(function() { cb.apply(null, args) });
};

function MissingPortError(name) {
  name = name || 'unknown method:';
  this.message = name + ' Port does not exist - please call hardware.createPort(path) first';
  this.name = 'MissingPortError';
  Error.captureStackTrace(this, MissingPortError);
}
inherits(MissingPortError, Error);

function ClosedPortError(name) {
  name = name || 'unknown method:';
  this.message = name + ' Port is closed';
  this.name = 'ClosedPortError';
  Error.captureStackTrace(this, MissingPortError);
}
inherits(ClosedPortError, Error);

var ports = {};

function MockBindings(opt) {
  if (typeof opt.disconnect !== 'function') {
    throw new TypeError('options.disconnect is not a function');
  }
  this.onDisconnect = opt.disconnect;
  this.pendingReadCB = null;
  this.isOpen = false;
};

MockBindings.reset = function() {
  ports = {};
};

// control function
MockBindings.createPort = function(path, opt) {
  opt = opt || {};
  var echo = opt.echo;
  var readyData = opt.readyData || new Buffer('READY');
  ports[path] = {
    data: new Buffer(0),
    lastWrite: null,
    echo: echo,
    readyData: readyData,
    info: {
      comName: path,
      manufacturer: 'The J5 Robotics Company',
      serialNumber: undefined,
      pnpId: undefined,
      locationId: undefined,
      vendorId: undefined,
      productId: undefined
    }
  };
};

MockBindings.list = function(cb) {
  var info = Object.keys(ports).map(function(path) {
    return ports[path].info;
  });
  processNextTick(cb, null, info);
};

// control function
MockBindings.prototype.emitData = function(data) {
  if (!this.isOpen) {
    return;
  }
  this.port.data = Buffer.concat([this.port.data, data]);

  if (this.port.pendingReadCB) {
    var buffer = this.port.pendingReadCB[0];
    var offset = this.port.pendingReadCB[1];
    var length = this.port.pendingReadCB[2];
    var cb = this.port.pendingReadCB[3];
    this.port.pendingReadCB = null;
    processNextTick(this.read.bind(this), buffer, offset, length, cb);
  }
};

MockBindings.prototype.disconnect = function(err) {
  err = err || new Error('disconnected');
  this.onDisconnect(err);
};

MockBindings.prototype.open = function(path, opt, cb) {
  var port = this.port = ports[path];
  if (!port) {
    return cb(new MissingPortError(path));
  }

  if (port.openOpt && port.openOpt.lock) {
    return cb(new Error('port is locked cannot open'));
  }

  if (this.isOpen) {
    return processNextTick(cb, new Error('open: binding is already open'));
  }

  port.openOpt = opt;
  processNextTick(function() {
    this.isOpen = true;
    processNextTick(function() {
      if (port.echo) {
        this.emitData(port.readyData);
      }
      cb(null);
    }.bind(this));
  }.bind(this));
};

MockBindings.prototype.close = function(cb) {
  var port = this.port;
  if (!port) {
    return processNextTick(cb, new Error('port is already closed'));
  }
  processNextTick(function() {
    delete port.openOpt;

    // reset data on close
    port.data = new Buffer(0);

    delete this.port;
    this.isOpen = false;
    processNextTick(cb, null);
  }.bind(this));
};

MockBindings.prototype.update = function(opt, cb) {
  if (typeof opt !== 'object') {
    throw new TypeError('options is not an object');
  }

  if (!opt.baudRate) {
    throw new Error('Missing baudRate');
  }

  if (!this.isOpen) {
    return processNextTick(cb, new ClosedPortError('update'));
  }
  this.port.openOpt.baudRate = opt.baudRate;
  processNextTick(cb, null);
};

MockBindings.prototype.set = function(opt, cb) {
  if (typeof opt !== 'object') {
    throw new TypeError('options is not an object');
  }

  if (!this.isOpen) {
    return processNextTick(cb, new ClosedPortError('set'));
  }
  processNextTick(cb, null);
};

MockBindings.prototype.write = function(buffer, cb) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError('buffer is not a Buffer');
  }

  if (typeof cb !== 'function') {
    throw new TypeError('callback is not a function');
  }

  if (!this.isOpen) {
    return processNextTick(cb, new ClosedPortError('write'));
  }

  var data = this.port.lastWrite = new Buffer(buffer); // copy
  processNextTick(cb, null);

  if (this.port.echo) {
    processNextTick(this.emitData.bind(this), data);
  }
};

MockBindings.prototype.read = function(buffer, offset, length, cb) {
  if (typeof cb !== 'function') {
    throw new TypeError("cb in read isn't a function");
  }

  if (!this.isOpen) {
    return processNextTick(cb, new ClosedPortError('read'));
  }

  if (this.port.data.length <= 0) {
    this.port.pendingReadCB = [buffer, offset, length, cb];
    return;
  }
  var data = this.port.data.slice(0, length);
  var readLength = data.copy(buffer, offset);
  this.port.data = this.port.data.slice(length);

  processNextTick(cb, null, readLength, buffer);
};

MockBindings.prototype.get = function(cb) {
  if (!this.isOpen) {
    return processNextTick(cb, new ClosedPortError('flush'));
  }
  processNextTick(cb, null, {
    cts: true,
    dsr: false,
    dcd: false
  });
};

MockBindings.prototype.flush = function(cb) {
  if (!this.isOpen) {
    return processNextTick(cb, new ClosedPortError('flush'));
  }
  processNextTick(cb, null);
};

MockBindings.prototype.drain = function(cb) {
  if (!this.isOpen) {
    return processNextTick(cb, new ClosedPortError('drain'));
  }
  processNextTick(cb, null);
};

module.exports = MockBindings;
