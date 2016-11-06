'use strict';

var binding = require('bindings')('serialport.node');
var assign = require('object.assign').getPolyfill();

var defaultBindingOptions = {
  vmin: 1,
  vtime: 0
};

function asyncError(cb, err) {
  process.nextTick(function() {
    cb(err);
  });
}

function LinuxBinding(opt) {
  if (typeof opt !== 'object') {
    throw new TypeError('"options" is not an object');
  }
  if (typeof opt.disconnect !== 'function') {
    throw new TypeError('"options.disconnect" is not a function');
  }
  this.disconnect = opt.disconnect;
  this.bindingOptions = opt.bindingOptions || {};
  this.fd = null;
};

LinuxBinding.list = require('./list-linux');

LinuxBinding.prototype.read = require('./read-unix');

LinuxBinding.prototype.open = function(path, options, cb) {
  if (!path) {
    throw new TypeError('"path" is not a valid port');
  }

  if (typeof options !== 'object') {
    throw new TypeError('"options" is not an object');
  }

  if (typeof cb !== 'function') {
    throw new TypeError('"cb" is not a function');
  }

  if (this.isOpen) {
    return asyncError(cb, new Error('Already open'));
  }

  options = assign({}, options, defaultBindingOptions, this.bindingOptions);

  binding.open(path, options, function afterOpen(err, fd) {
    if (err) {
      return cb(err);
    }
    this.fd = fd;
    cb(null);
  }.bind(this));
};

LinuxBinding.prototype.close = function(cb) {
  if (typeof cb !== 'function') {
    throw new TypeError('"cb" is not a function');
  }

  if (!this.isOpen) {
    return asyncError(cb, new Error('Port is not open'));
  }

  if (this.readPoller) {
    this.readPoller.stop();
    this.readPoller = null;
  }

  binding.close(this.fd, function afterClose(err) {
    if (err) {
      return cb(err);
    }
    this.fd = null;
    cb(null);
  }.bind(this));
};

LinuxBinding.prototype.set = function(options, cb) {
  if (typeof options !== 'object') {
    throw new TypeError('"options" is not an object');
  }

  if (typeof cb !== 'function') {
    throw new TypeError('"cb" is not a function');
  }

  if (!this.isOpen) {
    return asyncError(cb, new Error('Port is not open'));
  }
  binding.set(this.fd, options, cb);
};

LinuxBinding.prototype.write = function(buffer, cb) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError('"buffer" is not a Buffer');
  }

  if (typeof cb !== 'function') {
    throw new TypeError('"cb" is not a function');
  }

  if (!this.isOpen) {
    return asyncError(cb, new Error('Port is not open'));
  }
  binding.write(this.fd, buffer, cb);
};

var commonMethods = [
  'drain',
  'flush',
  'update',
  'get'
];

commonMethods.map(function(methodName) {
  LinuxBinding.prototype[methodName] = function() {
    var args = Array.prototype.slice.apply(arguments);
    var cb = args[args.length - 1];

    if (typeof cb !== 'function') {
      throw new TypeError('"cb" is not a function');
    }

    if (!this.isOpen) {
      return asyncError(cb, new Error('Port is not open'));
    }
    args.unshift(this.fd);
    binding[methodName].apply(binding, args);
  };
});

Object.defineProperty(LinuxBinding.prototype, 'isOpen', {
  enumerable: true,
  get: function() {
    return this.fd !== null;
  }
});

module.exports = LinuxBinding;
