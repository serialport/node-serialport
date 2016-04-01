'use strict';

// Copyright 2011 Chris Williams <chris@iterativedesigns.com>

// Require serialport binding from pre-compiled binaries using
// node-pre-gyp, if something fails or package not available fallback
// to regular build from source.

var debug = require('debug')('serialport');
var binary = require('node-pre-gyp');
var path = require('path');
var util = require('util');
var fs = require('fs');
var stream = require('stream');
var EventEmitter = require('events').EventEmitter;

var PACKAGE_JSON = path.join(__dirname, 'package.json');
var binding_path = binary.find(path.resolve(PACKAGE_JSON));
var SerialPortBinding = require(binding_path);
var parsers = require('./lib/parsers');
var listUnix = require('./lib/list-unix');

// Setup the factory
var factory = new EventEmitter();
factory.parsers = parsers;
if (process.platform === 'win32' || process.platform === 'darwin') {
  factory.list = SerialPortBinding.list;
} else {
  factory.list = function(callback) {
    callback = callback || function(err) {
      if (err) { this.emit('error', err) }
    }.bind(this);
    return listUnix(callback);
  };
}

//  VALIDATION ARRAYS
var DATABITS = [5, 6, 7, 8];
var STOPBITS = [1, 1.5, 2];
var PARITY = ['none', 'even', 'mark', 'odd', 'space'];
var FLOWCONTROLS = ['XON', 'XOFF', 'XANY', 'RTSCTS'];
// var SETS = ['rts', 'cts', 'dtr', 'dts', 'brk'];

// Stuff from ReadStream, refactored for our usage:
var kPoolSize = 40 * 1024;
var kMinPoolSpace = 128;

function makeDefaultPlatformOptions() {
  var options = {};

  if (process.platform !== 'win32') {
    options.vmin = 1;
    options.vtime = 0;
  }

  return options;
}

// The default options, can be overwritten in the 'SerialPort' constructor
var _options = {
  baudrate: 9600,
  parity: 'none',
  rtscts: false,
  xon: false,
  xoff: false,
  xany: false,
  hupcl: true,
  rts: true,
  cts: false,
  dtr: true,
  dts: false,
  brk: false,
  databits: 8,
  stopbits: 1,
  buffersize: 256,
  parser: parsers.raw,
  platformOptions: makeDefaultPlatformOptions()
};

function SerialPort(path, options, openImmediately, callback) {
  var self = this;

  var args = Array.prototype.slice.call(arguments);
  callback = args.pop();
  if (typeof (callback) !== 'function') {
    callback = null;
  }
  options = (typeof options !== 'function') && options || {};

  var opts = {};

  openImmediately = (openImmediately === undefined || openImmediately === null) ? true : openImmediately;

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

  opts.baudRate = options.baudRate || options.baudrate || _options.baudrate;

  opts.dataBits = options.dataBits || options.databits || _options.databits;
  if (DATABITS.indexOf(opts.dataBits) === -1) {
    return callback(new Error('Invalid "databits": ' + opts.dataBits));
  }

  opts.stopBits = options.stopBits || options.stopbits || _options.stopbits;
  if (STOPBITS.indexOf(opts.stopBits) === -1) {
    return callback(new Error('Invalid "stopbits": ' + opts.stopbits));
  }

  opts.parity = options.parity || _options.parity;
  if (PARITY.indexOf(opts.parity) === -1) {
    return callback(new Error('Invalid "parity": ' + opts.parity));
  }
  if (!path) {
    return callback(new Error('Invalid port specified: ' + path));
  }

  // flush defaults, then update with provided details
  opts.rtscts = _options.rtscts;
  opts.xon = _options.xon;
  opts.xoff = _options.xoff;
  opts.xany = _options.xany;

  if (options.flowControl || options.flowcontrol) {
    var fc = options.flowControl || options.flowcontrol;

    if (typeof fc === 'boolean') {
      opts.rtscts = true;
    } else {
      var clean = fc.every(function (flowControl) {
        var fcup = flowControl.toUpperCase();
        var idx = FLOWCONTROLS.indexOf(fcup);
        if (idx < 0) {
          var err = new Error('Invalid "flowControl": ' + fcup + '. Valid options: ' + FLOWCONTROLS.join(', '));
          callback(err);
          return false;
        }
        // "XON", "XOFF", "XANY", "DTRDTS", "RTSCTS"
        switch (idx) {
          case 0: opts.xon = true; break;
          case 1: opts.xoff = true; break;
          case 2: opts.xany = true; break;
          case 3: opts.rtscts = true; break;
        }
        return true;
      });
      if (!clean) {
        // TODO this is very very messy
        return;
      }
    }
  }

  opts.bufferSize = options.bufferSize || options.buffersize || _options.buffersize;
  opts.parser = options.parser || _options.parser;
  opts.platformOptions = options.platformOptions || _options.platformOptions;
  options.hupcl = (typeof options.hupcl === 'boolean') ? options.hupcl : _options.hupcl;
  opts.dataCallback = options.dataCallback || function (data) {
    opts.parser(self, data);
  };

  // TODO this is inconsistent with #disconnected
  opts.disconnectedCallback = options.disconnectedCallback || function (err) {
    if (self.closing) {
      return;
    }
    if (!err) {
      err = new Error('Disconnected');
    }
    self.emit('disconnect', err);
  };

  this.fd = null;
  this.paused = true;

  if (process.platform !== 'win32') {
    // All other platforms:
    this.bufferSize = options.bufferSize || 64 * 1024;
    this.readable = true;
    this.reading = false;
  }

  this.options = opts;
  this.path = path;

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

SerialPort.prototype._startPolling = function() {
  this.paused = false;
  this.serialPoller = new SerialPortBinding.SerialportPoller(this.fd, function (err) {
    if (err) {
      this.disconnected(err);
    } else {
      this._read();
    }
  }.bind(this));
  this.serialPoller.start();
};

SerialPort.prototype.open = function (callback) {
  if (this.isOpen()) {
    return this._error(new Error('Port is already open'), callback);
  }

  if (this.opening) {
    return this._error(new Error('Port is opening'), callback);
  }

  this.opening = true;
  this.paused = true;
  this.readable = true;
  this.reading = false;
  SerialPortBinding.open(this.path, this.options, function (err, fd) {
    if (err) { return this._error(err, callback) }
    this.fd = fd;
    this.opening = false;

    if (process.platform !== 'win32') {
      this._startPolling();
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
    debug('Update attempted, but serialport not open');
    var err = new Error('Serialport not open.');
    return this._error(err, callback);
  }

  this.options.baudRate = options.baudRate || options.baudrate || _options.baudrate;

  SerialPortBinding.update(this.fd, this.options, function (err) {
    if (err) {
      return this._error(err, callback);
    }
    this.emit('open');
    if (callback) { callback() }
  }.bind(this));
};

SerialPort.prototype.isOpen = function() {
  return this.fd !== null;
};

SerialPort.prototype.write = function (buffer, callback) {
  if (!this.isOpen()) {
    debug('Write attempted, but serialport is not open');
    var err = new Error('Serialport not open.');
    return this._error(err, callback);
  }

  if (!Buffer.isBuffer(buffer)) {
    buffer = new Buffer(buffer);
  }
  debug('Write: ' + JSON.stringify(buffer));
  SerialPortBinding.write(this.fd, buffer, function (err, results) {
    if (callback) {
      callback(err, results);
    } else {
      if (err) {
        this.emit('error', err);
      }
    }
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

    var self = this;
    function afterRead(err, bytesRead, readPool, bytesRequested) {
      self.reading = false;
      if (err) {
        if (err.code && err.code === 'EAGAIN') {
          if (!self.closing && self.isOpen()) {
            self.serialPoller.start();
          }
        // handle edge case were mac/unix doesn't clearly know the error.
        } else if (err.code && (err.code === 'EBADF' || err.code === 'ENXIO' || (err.errno === -1 || err.code === 'UNKNOWN'))) {
          self.disconnected(err);
        } else {
          self.fd = null;
          self.readable = false;
          self.emit('error', err);
        }
      } else {
        // Since we will often not read the number of bytes requested,
        // let's mark the ones we didn't need as available again.
        self.pool.used -= bytesRequested - bytesRead;

        if (bytesRead === 0) {
          if (self.isOpen()) {
            self.serialPoller.start();
          }
        } else {
          var b = self.pool.slice(start, start + bytesRead);

          // do not emit events if the stream is paused
          if (self.paused) {
            self.buffer = Buffer.concat([self.buffer, b]);
            return;
          }
          self._emitData(b);

          // do not emit events anymore after we declared the stream unreadable
          if (!self.readable) {
            return;
          }
          self._read();
        }
      }
    }

    fs.read(self.fd, self.pool, self.pool.used, toRead, null, function (err, bytesRead) {
      var readPool = self.pool;
      var bytesRequested = toRead;
      afterRead(err, bytesRead, readPool, bytesRequested);
    });

    self.pool.used += toRead;
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

// who calls this?
SerialPort.prototype.disconnected = function (err) {
  var fd = this.fd;

  // send notification of disconnect
  if (this.options.disconnectedCallback) {
    this.options.disconnectedCallback(err);
  } else {
    this.emit('disconnect', err);
  }
  this.paused = true;
  this.closing = true;

  // TODO this try catch is dubious
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
  this.emit('close');

  // TODO THIS IS CRAZY TOWN
  this.removeAllListeners();

  if (process.platform !== 'win32') {
    this.readable = false;
    this.serialPoller.close();
  }
};

SerialPort.prototype.close = function (callback) {
  var fd = this.fd;

  if (this.closing) {
    // TODO this should be an error
    return;
  }

  if (!this.isOpen()) {
    var err = new Error('Serialport not open.');
    return this._error(err, callback);
  }

  this.closing = true;

  // Stop polling before closing the port.
  if (process.platform !== 'win32') {
    this.readable = false;
    this.serialPoller.close();
  }

  var self = this;

  // TODO dubious try/catch, also this.closing is inconsistently set
  try {
    SerialPortBinding.close(fd, function (err) {
      if (err) {
        return self._error(err, callback);
      }

      self.closing = false;
      self.fd = null;
      self.emit('close');
      if (callback) { callback() }

      // TODO This is crazy town
      self.removeAllListeners();
    });
  } catch (err) {
    self.closing = false;
    return self._error(err, callback);
  }
};

SerialPort.prototype.flush = function (callback) {
  var self = this;
  var fd = self.fd;

  if (!this.isOpen()) {
    var err = new Error('Serialport not open.');
    return this._error(err, callback);
  }

  SerialPortBinding.flush(fd, function (err, result) {
    if (callback) {
      callback(err, result);
    } else if (err) {
      self.emit('error', err);
    }
  });
};

SerialPort.prototype.set = function (options, callback) {
  options = (typeof option !== 'function') && options || {};

  // flush defaults, then update with provided details

  if (!options.hasOwnProperty('rts')) {
    options.rts = _options.rts;
  }
  if (!options.hasOwnProperty('dtr')) {
    options.dtr = _options.dtr;
  }
  if (!options.hasOwnProperty('cts')) {
    options.cts = _options.cts;
  }
  if (!options.hasOwnProperty('dts')) {
    options.dts = _options.dts;
  }
  if (!options.hasOwnProperty('brk')) {
    options.brk = _options.brk;
  }

  if (!this.isOpen()) {
    var err = new Error('Serialport not open.');
    return this._error(err, callback);
  }

  SerialPortBinding.set(this.fd, options, function (err, result) {
    if (callback) {
      callback(err, result);
    } else if (err) {
      this.emit('error', err);
    }
  }.bind(this));
};

SerialPort.prototype.drain = function (callback) {
  if (!this.isOpen()) {
    var err = new Error('Serialport not open.');
    return this._error(err, callback);
  }

  SerialPortBinding.drain(this.fd, function (err, result) {
    if (callback) {
      callback(err, result);
    } else if (err) {
      this.emit('error', err);
    }
  }.bind(this));
};

module.exports = factory;
