'use strict';

// Copyright 2011 Chris Williams <chris@iterativedesigns.com>

// Require serialport binding from pre-compiled binaries using
// node-pre-gyp, if something fails or package not available fallback
// to regular build from source.

// 3rd Party Dependencies
var debug = require('debug')('serialport');

// shims
var assign = require('object.assign').getPolyfill();

// Internal Dependencies
var SerialPortBinding = require('./bindings');
var parsers = require('./parsers');

// Built-ins Dependencies
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var stream = require('stream');
var util = require('util');

// Setup the factory
var factory = new EventEmitter();
factory.parsers = parsers;
factory.list = SerialPortBinding.list;

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
  parity: 'none',
  xon: false,
  xoff: false,
  xany: false,
  rtscts: false,
  hupcl: true,
  dataBits: 8,
  stopBits: 1,
  bufferSize: 64 * 1024,
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
  'platformOptions',
  'flowControl'
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

function SerialPort(path, options, openImmediately, callback) {
  var args = Array.prototype.slice.call(arguments);
  callback = args.pop();
  if (typeof callback !== 'function') {
    callback = null;
  }

  options = (typeof options !== 'function') && options || {};

  if (openImmediately === undefined || openImmediately === null) {
    openImmediately = true;
  }

  stream.Stream.call(this);
  callback = callback || function (err) {
    if (err) {
      if (this._events.error) {
        this.emit('error', err);
      } else {
        factory.emit('error', err);
      }
    }
  }.bind(this);

  if (!path) {
    return callback(new Error('Invalid port specified: ' + path));
  }
  this.path = path;

  var correctedOptions = correctOptions(options);
  var settings = assign({}, defaultSettings, correctedOptions);

  if (DATABITS.indexOf(settings.dataBits) === -1) {
    return callback(new Error('Invalid "databits": ' + settings.dataBits));
  }

  if (STOPBITS.indexOf(settings.stopBits) === -1) {
    return callback(new Error('Invalid "stopbits": ' + settings.stopbits));
  }

  if (PARITY.indexOf(settings.parity) === -1) {
    return callback(new Error('Invalid "parity": ' + settings.parity));
  }

  var fc = settings.flowControl;
  if (fc === true) {
    // Why!?
    settings.rtscts = true;
  } else if (Array.isArray(fc)) {
    for (var i = fc.length - 1; i >= 0; i--) {
      var fcSetting = fc[i].toLowerCase();
      if (FLOWCONTROLS.indexOf(fcSetting) > -1) {
        settings[fcSetting] = true;
      } else {
        return callback(new Error('Invalid flowControl option: ' + fcSetting));
      }
    }
  }

  // TODO remove this option
  settings.dataCallback = options.dataCallback || function (data) {
    settings.parser(this, data);
  }.bind(this);

  // TODO remove this option
  settings.disconnectedCallback = options.disconnectedCallback || function (err) {
    if (this.closing) {
      return;
    }
    if (!err) {
      err = new Error('Disconnected');
    }
    this.emit('disconnect', err);
  }.bind(this);

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

  if (openImmediately) {
    process.nextTick(function () {
      this.open(callback);
    }.bind(this));
  }
}

factory.SerialPort = SerialPort;
util.inherits(SerialPort, stream.Stream);

SerialPort.prototype._error = function(error, callback) {
  if (callback) {
    callback(error);
  } else {
    this.emit('error', error);
  }
};

SerialPort.prototype.open = function (callback) {
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

  SerialPortBinding.open(this.path, this.options, function (err, fd) {
    if (err) {
      debug('SerialPortBinding.open had an error', err);
      return this._error(err, callback);
    }
    this.fd = fd;
    this.paused = false;
    this.opening = false;

    if (process.platform !== 'win32') {
      this.serialPoller = new SerialPortBinding.SerialportPoller(this.fd, function (err) {
        if (!err) {
          this._read();
        } else {
          this.disconnected(err);
        }
      }.bind(this));
      this.serialPoller.start();
    }

    this.emit('open');
    if (callback) { callback() }
  }.bind(this));
};

// underlying code is written to update all options, but for now
// only baud is respected as I don't want to duplicate all the option
// verification code above
SerialPort.prototype.update = function (options, callback) {
  if (!this.isOpen()) {
    debug('update attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  var correctedOptions = correctOptions(options);
  var settings = assign({}, defaultSettings, correctedOptions);
  this.options.baudRate = settings.baudRate;

  SerialPortBinding.update(this.fd, this.options, function (err) {
    if (err) {
      return this._error(err, callback);
    }
    this.emit('open');
    if (callback) { callback() }
  }.bind(this));
};

SerialPort.prototype.isOpen = function() {
  return this.fd !== null && !this.closing;
};

SerialPort.prototype.write = function (buffer, callback) {
  if (!this.isOpen()) {
    debug('write attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  if (!Buffer.isBuffer(buffer)) {
    buffer = new Buffer(buffer);
  }
  debug('write data: ' + JSON.stringify(buffer));
  SerialPortBinding.write(this.fd, buffer, function (err, result) {
    if (err) {
      debug('SerialPortBinding.write had an error', err);
      return this._error(err, callback);
    }
    if (callback) { callback(null, result) }
  }.bind(this));
};

if (process.platform !== 'win32') {
  SerialPort.prototype._read = function () {
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
          this.disconnected(err);
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

    fs.read(this.fd, this.pool, this.pool.used, toRead, null, function (err, bytesRead) {
      var readPool = this.pool;
      var bytesRequested = toRead;
      _afterRead(err, bytesRead, readPool, bytesRequested);
    }.bind(this));

    this.pool.used += toRead;
  };

  SerialPort.prototype._emitData = function (data) {
    this.options.dataCallback(data);
  };

  SerialPort.prototype.pause = function () {
    this.paused = true;
  };

  SerialPort.prototype.resume = function () {
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

SerialPort.prototype.disconnected = function (err) {
  // send notification of disconnect
  if (this.options.disconnectedCallback) {
    this.options.disconnectedCallback(err);
  } else {
    this.emit('disconnect', err);
  }
  this.paused = true;
  this.closing = true;

  this.emit('close');

  // clean up all other items
  var fd = this.fd;
  try {
    SerialPortBinding.close(fd, function (err) {
      if (err) {
        debug('Disconnect completed with error: ' + JSON.stringify(err));
      } else {
        debug('Disconnect completed.');
      }
    });
  } catch (e) {
    debug('Disconnect completed with an exception: ' + JSON.stringify(e));
  }

  this.closing = false;
  this.fd = null;

  if (process.platform !== 'win32') {
    this.readable = false;
    this.serialPoller.close();
  }
};

SerialPort.prototype.close = function (callback) {
  var fd = this.fd;

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
  try {
    SerialPortBinding.close(fd, function (err) {
      this.closing = false;
      if (err) {
        debug('SerialPortBinding.close had an error', err);
        return this._error(err, callback);
      }

      this.fd = null;
      this.emit('close');
      if (callback) { callback() }
    }.bind(this));
  } catch (err) {
    this.closing = false;
    debug('SerialPortBinding.close had an throwing error', err);
    return this._error(err, callback);
  }
};

SerialPort.prototype.flush = function (callback) {
  if (!this.isOpen()) {
    debug('flush attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  SerialPortBinding.flush(this.fd, function (err, result) {
    if (err) {
      debug('SerialPortBinding.flush had an error', err);
      return this._error(err, callback);
    }
    if (callback) { callback(null, result) }
  }.bind(this));
};

SerialPort.prototype.set = function (options, callback) {
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

  SerialPortBinding.set(this.fd, settings, function (err, result) {
    if (err) {
      debug('SerialPortBinding.set had an error', err);
      return this._error(err, callback);
    }
    if (callback) { callback(null, result) }
  }.bind(this));
};

SerialPort.prototype.drain = function (callback) {
  var fd = this.fd;

  if (!this.isOpen()) {
    debug('drain attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  SerialPortBinding.drain(fd, function (err, result) {
    if (err) {
      debug('SerialPortBinding.drain had an error', err);
      return this._error(err, callback);
    }
    if (callback) { callback(null, result) }
  }.bind(this));
};

module.exports = factory;
