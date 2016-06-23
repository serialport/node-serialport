'use strict';

// Copyright 2011 Chris Williams <chris@iterativedesigns.com>

// 3rd Party Dependencies
var debug = require('debug')('serialport');

// shims
var assign = require('object.assign').getPolyfill();

// Internal Dependencies
var SerialPortBinding = require('./bindings');
var parsers = require('./parsers');

// Built-ins Dependencies
var fs = require('fs');
var stream = require('stream');
var util = require('util');

//  VALIDATION ARRAYS
var DATABITS = [5, 6, 7, 8];
var STOPBITS = [1, 1.5, 2];
var PARITY = ['none', 'even', 'mark', 'odd', 'space'];
var FLOWCONTROLS = ['xon', 'xoff', 'xany', 'rtscts'];
var SET_OPTIONS = ['brk', 'cts', 'dtr', 'dts', 'rts'];

// Stuff from ReadStream, refactored for our usage:
var kPoolSize = 40 * 1024;
var kMinPoolSpace = 128;

var defaultSettings = {
  baudRate: 9600,
  autoOpen: true,
  parity: 'none',
  xon: false,
  xoff: false,
  xany: false,
  rtscts: false,
  hupcl: true,
  dataBits: 8,
  stopBits: 1,
  bufferSize: 64 * 1024,
  lock: true,
  parser: parsers.raw,
  platformOptions: SerialPortBinding.platformOptions
};

var defaultSetFlags = {
  brk: false,
  cts: false,
  dtr: true,
  dts: false,
  rts: true
};

// deprecate the lowercase version of these options next major release
var LOWERCASE_OPTIONS = [
  'baudRate',
  'dataBits',
  'stopBits',
  'bufferSize',
  'platformOptions'
];

function correctOptions(options) {
  LOWERCASE_OPTIONS.forEach(function(name) {
    var lowerName = name.toLowerCase();
    if (options.hasOwnProperty(lowerName)) {
      var value = options[lowerName];
      delete options[lowerName];
      options[name] = value;
    }
  });
  return options;
}

function SerialPort(path, options, callback) {
  if (typeof callback === 'boolean') {
    throw new TypeError('`openImmediately` is now called `autoOpen` and is a property of options');
  }

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = options || {};

  stream.Stream.call(this);

  if (!path) {
    throw new TypeError('No path specified');
  }

  this.path = path;

  var correctedOptions = correctOptions(options);
  var settings = assign({}, defaultSettings, correctedOptions);

  if (typeof settings.baudRate !== 'number') {
    throw new TypeError('Invalid "baudRate" must be a number got: ' + settings.baudRate);
  }

  if (DATABITS.indexOf(settings.dataBits) === -1) {
    throw new TypeError('Invalid "databits": ' + settings.dataBits);
  }

  if (STOPBITS.indexOf(settings.stopBits) === -1) {
    throw new TypeError('Invalid "stopbits": ' + settings.stopbits);
  }

  if (PARITY.indexOf(settings.parity) === -1) {
    throw new TypeError('Invalid "parity": ' + settings.parity);
  }

  FLOWCONTROLS.forEach(function(control) {
    if (typeof settings[control] !== 'boolean') {
      throw new TypeError('Invalid "' + control + '" is not boolean');
    }
  });

  settings.disconnectedCallback = this._disconnected.bind(this);
  settings.dataCallback = settings.parser.bind(this, this);

  this.fd = null;
  this.paused = true;
  this.opening = false;
  this.closing = false;

  if (process.platform !== 'win32') {
    this.bufferSize = settings.bufferSize;
    this.readable = true;
    this.reading = false;
  }

  this.options = settings;

  if (this.options.autoOpen) {
    // is nextTick necessary?
    process.nextTick(this.open.bind(this, callback));
  }
}

util.inherits(SerialPort, stream.Stream);

SerialPort.prototype._error = function(error, callback) {
  if (callback) {
    callback.call(this, error);
  } else {
    this.emit('error', error);
  }
};

SerialPort.prototype.open = function(callback) {
  if (this.isOpen()) {
    return this._error(new Error('Port is already open'), callback);
  }

  if (this.opening) {
    return this._error(new Error('Port is opening'), callback);
  }

  this.paused = true;
  this.readable = true;
  this.reading = false;
  this.opening = true;

  SerialPortBinding.open(this.path, this.options, function(err, fd) {
    if (err) {
      debug('SerialPortBinding.open had an error', err);
      return this._error(err, callback);
    }
    this.fd = fd;
    this.paused = false;
    this.opening = false;

    if (process.platform !== 'win32') {
      this.serialPoller = new SerialPortBinding.SerialportPoller(this.fd, function(err) {
        if (!err) {
          this._read();
        } else {
          this._disconnected(err);
        }
      }.bind(this));
      this.serialPoller.start();
    }

    this.emit('open');
    if (callback) { callback.call(this, null) }
  }.bind(this));
};

SerialPort.prototype.update = function(options, callback) {
  if (!this.isOpen()) {
    debug('update attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  var correctedOptions = correctOptions(options);
  var settings = assign({}, defaultSettings, correctedOptions);
  this.options.baudRate = settings.baudRate;

  SerialPortBinding.update(this.fd, this.options, function(err) {
    if (err) {
      return this._error(err, callback);
    }
    if (callback) { callback.call(this, null) }
  }.bind(this));
};

SerialPort.prototype.isOpen = function() {
  return this.fd !== null && !this.closing;
};

SerialPort.prototype.write = function(buffer, callback) {
  if (!this.isOpen()) {
    debug('write attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  if (!Buffer.isBuffer(buffer)) {
    buffer = new Buffer(buffer);
  }

  debug('write ' + buffer.length + ' bytes of data');
  SerialPortBinding.write(this.fd, buffer, function(err) {
    if (err) {
      debug('SerialPortBinding.write had an error', err);
      return this._error(err, callback);
    }
    if (callback) { callback.call(this, null) }
  }.bind(this));
};

if (process.platform !== 'win32') {
  SerialPort.prototype._read = function() {
    if (!this.readable || this.paused || this.reading || this.closing) {
      return;
    }

    this.reading = true;

    if (!this.pool || this.pool.length - this.pool.used < kMinPoolSpace) {
      // discard the old pool. Can't add to the free list because
      // users might have references to slices on it.
      this.pool = new Buffer(kPoolSize);
      this.pool.used = 0;
    }

    // Grab another reference to the pool in the case that while we're in the
    // thread pool another read() finishes up the pool, and allocates a new
    // one.
    var toRead = Math.min(this.pool.length - this.pool.used, ~~this.bufferSize);
    var start = this.pool.used;

    var _afterRead = function(err, bytesRead, readPool, bytesRequested) {
      this.reading = false;
      if (err) {
        if (err.code && err.code === 'EAGAIN') {
          if (this.isOpen()) {
            this.serialPoller.start();
          }
        // handle edge case were mac/unix doesn't clearly know the error.
        } else if (err.code && (err.code === 'EBADF' || err.code === 'ENXIO' || (err.errno === -1 || err.code === 'UNKNOWN'))) {
          this._disconnected(err);
        } else {
          this.fd = null;
          this.readable = false;
          this.emit('error', err);
        }
        return;
      }

      // Since we will often not read the number of bytes requested,
      // let's mark the ones we didn't need as available again.
      this.pool.used -= bytesRequested - bytesRead;

      if (bytesRead === 0) {
        if (this.isOpen()) {
          this.serialPoller.start();
        }
      } else {
        var b = this.pool.slice(start, start + bytesRead);

        // do not emit events if the stream is paused
        if (this.paused) {
          this.buffer = Buffer.concat([this.buffer, b]);
          return;
        }
        this._emitData(b);

        // do not emit events anymore after we declared the stream unreadable
        if (!this.readable) {
          return;
        }
        this._read();
      }
    }.bind(this);

    fs.read(this.fd, this.pool, this.pool.used, toRead, null, function(err, bytesRead) {
      var readPool = this.pool;
      var bytesRequested = toRead;
      _afterRead(err, bytesRead, readPool, bytesRequested);
    }.bind(this));

    this.pool.used += toRead;
  };

  SerialPort.prototype._emitData = function(data) {
    this.options.dataCallback(data);
  };

  SerialPort.prototype.pause = function() {
    this.paused = true;
  };

  SerialPort.prototype.resume = function() {
    this.paused = false;

    if (this.buffer) {
      var buffer = this.buffer;
      this.buffer = null;
      this._emitData(buffer);
    }

    // No longer open?
    if (!this.isOpen()) {
      return;
    }

    this._read();
  };
} // if !'win32'

SerialPort.prototype._disconnected = function(err) {
  this.paused = true;
  this.emit('disconnect', err);
  if (this.closing) {
    return;
  }

  if (this.fd === null) {
    return;
  }

  this.closing = true;
  if (process.platform !== 'win32') {
    this.readable = false;
    this.serialPoller.close();
  }

  SerialPortBinding.close(this.fd, function(err) {
    this.closing = false;
    if (err) {
      debug('Disconnect close completed with error: ', err);
    }
    this.fd = null;
    this.emit('close');
  }.bind(this));
};

SerialPort.prototype.close = function(callback) {
  this.paused = true;

  if (this.closing) {
    debug('close attempted, but port is already closing');
    return this._error(new Error('Port is not open'), callback);
  }

  if (!this.isOpen()) {
    debug('close attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  this.closing = true;

  // Stop polling before closing the port.
  if (process.platform !== 'win32') {
    this.readable = false;
    this.serialPoller.close();
  }
  SerialPortBinding.close(this.fd, function(err) {
    this.closing = false;
    if (err) {
      debug('SerialPortBinding.close had an error', err);
      return this._error(err, callback);
    }

    this.fd = null;
    this.emit('close');
    if (callback) { callback.call(this, null) }
  }.bind(this));
};

SerialPort.prototype.flush = function(callback) {
  if (!this.isOpen()) {
    debug('flush attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  SerialPortBinding.flush(this.fd, function(err, result) {
    if (err) {
      debug('SerialPortBinding.flush had an error', err);
      return this._error(err, callback);
    }
    if (callback) { callback.call(this, null, result) }
  }.bind(this));
};

SerialPort.prototype.set = function(options, callback) {
  if (!this.isOpen()) {
    debug('set attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  options = options || {};
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  var settings = {};
  for (var i = SET_OPTIONS.length - 1; i >= 0; i--) {
    var flag = SET_OPTIONS[i];
    if (options[flag] !== undefined) {
      settings[flag] = options[flag];
    } else {
      settings[flag] = defaultSetFlags[flag];
    }
  }

  SerialPortBinding.set(this.fd, settings, function(err) {
    if (err) {
      debug('SerialPortBinding.set had an error', err);
      return this._error(err, callback);
    }
    if (callback) { callback.call(this, null) }
  }.bind(this));
};

SerialPort.prototype.drain = function(callback) {
  if (!this.isOpen()) {
    debug('drain attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  SerialPortBinding.drain(this.fd, function(err) {
    if (err) {
      debug('SerialPortBinding.drain had an error', err);
      return this._error(err, callback);
    }
    if (callback) { callback.call(this, null) }
  }.bind(this));
};

SerialPort.parsers = parsers;
SerialPort.list = SerialPortBinding.list;

// Write a depreciation warning once
Object.defineProperty(SerialPort, 'SerialPort', {
  get: function() {
    console.warn('DEPRECATION: Please use `require(\'serialport\')` instead of `require(\'serialport\').SerialPort`');
    Object.defineProperty(SerialPort, 'SerialPort', {
      value: SerialPort
    });
    return SerialPort;
  },
  configurable: true
});

module.exports = SerialPort;
