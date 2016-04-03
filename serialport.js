'use strict';

// Copyright 2011 Chris Williams <chris@iterativedesigns.com>

// Require serialport binding from pre-compiled binaries using
// node-pre-gyp, if something fails or package not available fallback
// to regular build from source.

var debug = require('debug')('serialport');
var binary = require('node-pre-gyp');
var path = require('path');
var PACKAGE_JSON = path.join(__dirname, 'package.json');
var binding_path = binary.find(path.resolve(PACKAGE_JSON));
var SerialPortBinding = require(binding_path);
var parsers = require('./lib/parsers');
var listUnix = require('./lib/list-unix');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var stream = require('stream');

function SerialPortFactory() {
  var factory = this;

  // Removing check for valid BaudRates due to ticket: #140
  // var BAUDRATES = [500000, 230400, 115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300, 200, 150, 134, 110, 75, 50];

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
        if (self._events.error) {
          self.emit('error', err);
        } else {
          factory.emit('error', err);
        }
      }
    };

    var err;

    opts.baudRate = options.baudRate || options.baudrate || _options.baudrate;

    opts.dataBits = options.dataBits || options.databits || _options.databits;
    if (DATABITS.indexOf(opts.dataBits) === -1) {
      err = new Error('Invalid "databits": ' + opts.dataBits);
      callback(err);
      return;
    }

    opts.stopBits = options.stopBits || options.stopbits || _options.stopbits;
    if (STOPBITS.indexOf(opts.stopBits) === -1) {
      err = new Error('Invalid "stopbits": ' + opts.stopbits);
      callback(err);
      return;
    }

    opts.parity = options.parity || _options.parity;
    if (PARITY.indexOf(opts.parity) === -1) {
      err = new Error('Invalid "parity": ' + opts.parity);
      callback(err);
      return;
    }
    if (!path) {
      err = new Error('Invalid port specified: ' + path);
      callback(err);
      return;
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
    this.opening = false;
    this.closing = false;

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
        self.open(callback);
      });
    }
  }

  SerialPort.prototype = Object.create(stream.Stream.prototype, {
    constructor: {
      value: SerialPort
    }
  });

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

    var self = this;
    factory.SerialPortBinding.open(this.path, this.options, function (err, fd) {
      if (err) {
        if (callback) {
          callback(err);
        } else {
          self.emit('error', err);
        }
        return;
      }
      self.fd = fd;
      self.paused = false;
      self.opening = false;

      if (process.platform !== 'win32') {
        self.serialPoller = new factory.SerialPortBinding.SerialportPoller(self.fd, function (err) {
          if (!err) {
            self._read();
          } else {
            self.disconnected(err);
          }
        });
        self.serialPoller.start();
      }

      self.emit('open');
      if (callback) { callback() }
    });
  };

  // underlying code is written to update all options, but for now
  // only baud is respected as I don't want to duplicate all the option
  // verification code above
  SerialPort.prototype.update = function (options, callback) {
    if (!this.isOpen()) {
      debug('update attempted, but port is not open');
      return this._error(new Error('Port is not open'), callback);
    }

    this.options.baudRate = options.baudRate || options.baudrate || _options.baudrate;

    var self = this;
    factory.SerialPortBinding.update(this.fd, this.options, function (err) {
      if (err) {
        if (callback) {
          callback(err);
        } else {
          self.emit('error', err);
        }
        return;
      }
      self.emit('open');
      if (callback) { callback() }
    });
  };

  SerialPort.prototype.isOpen = function() {
    return this.fd !== null;
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

    var self = this;
    factory.SerialPortBinding.write(this.fd, buffer, function (err, results) {
      if (callback) {
        callback(err, results);
      } else {
        if (err) {
          self.emit('error', err);
        }
      }
    });
  };

  if (process.platform !== 'win32') {
    SerialPort.prototype._read = function () {
      var self = this;
      if (!self.readable || self.paused || self.reading || this.closing) {
        return;
      }

      self.reading = true;

      if (!self.pool || self.pool.length - self.pool.used < kMinPoolSpace) {
        // discard the old pool. Can't add to the free list because
        // users might have references to slices on it.
        self.pool = new Buffer(kPoolSize);
        self.pool.used = 0;
      }

      // Grab another reference to the pool in the case that while we're in the
      // thread pool another read() finishes up the pool, and allocates a new
      // one.
      var toRead = Math.min(self.pool.length - self.pool.used, ~~self.bufferSize);
      var start = self.pool.used;

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
      var self = this;
      self.paused = true;
    };

    SerialPort.prototype.resume = function () {
      var self = this;
      self.paused = false;

      if (self.buffer) {
        var buffer = self.buffer;
        self.buffer = null;
        self._emitData(buffer);
      }

      // No longer open?
      if (!this.isOpen()) {
        return;
      }

      self._read();
    };
  } // if !'win32'

  SerialPort.prototype.disconnected = function (err) {
    var self = this;
    var fd = self.fd;

    // send notification of disconnect
    if (self.options.disconnectedCallback) {
      self.options.disconnectedCallback(err);
    } else {
      self.emit('disconnect', err);
    }
    self.paused = true;
    self.closing = true;

    self.emit('close');

    // clean up all other items
    fd = self.fd;

    try {
      factory.SerialPortBinding.close(fd, function (err) {
        if (err) {
          debug('Disconnect completed with error: ' + JSON.stringify(err));
        } else {
          debug('Disconnect completed.');
        }
      });
    } catch (e) {
      debug('Disconnect completed with an exception: ' + JSON.stringify(e));
    }

    // TODO THIS IS CRAZY TOWN
    self.removeAllListeners();

    self.closing = false;
    self.fd = null;

    if (process.platform !== 'win32') {
      self.readable = false;
      self.serialPoller.close();
    }
  };

  SerialPort.prototype.close = function (callback) {
    var self = this;
    var fd = self.fd;

    if (self.closing) {
      debug('close attempted, but port is already closing');
      return this._error(new Error('Port is not open'), callback);
    }

    if (!this.isOpen()) {
      debug('close attempted, but port is not open');
      return this._error(new Error('Port is not open'), callback);
    }

    self.closing = true;

    // Stop polling before closing the port.
    if (process.platform !== 'win32') {
      self.readable = false;
      self.serialPoller.close();
    }

    try {
      factory.SerialPortBinding.close(fd, function (err) {
        self.closing = false;
        if (err) {
          debug('SerialPortBinding.close had an error', err);
          return self._error(err, callback);
        }

        self.fd = null;
        self.emit('close');
        if (callback) { callback() }
        self.removeAllListeners();
      });
    } catch (err) {
      this.closing = false;
      debug('SerialPortBinding.close had an throwing error', err);
      return this._error(err, callback);
    }
  };

  SerialPort.prototype.flush = function (callback) {
    var self = this;
    var fd = self.fd;

    if (!this.isOpen()) {
      debug('flush attempted, but port is not open');
      return this._error(new Error('Port is not open'), callback);
    }

    factory.SerialPortBinding.flush(fd, function (err, result) {
      if (callback) {
        callback(err, result);
      } else if (err) {
        self.emit('error', err);
      }
    });
  };

  SerialPort.prototype.set = function (options, callback) {
    if (!this.isOpen()) {
      debug('set attempted, but port is not open');
      return this._error(new Error('Port is not open'), callback);
    }

    var self = this;
    var fd = self.fd;

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

    factory.SerialPortBinding.set(fd, options, function (err, result) {
      if (callback) {
        callback(err, result);
      } else if (err) {
        self.emit('error', err);
      }
    });
  };

  SerialPort.prototype.drain = function (callback) {
    var self = this;
    var fd = this.fd;

    if (!this.isOpen()) {
      debug('drain attempted, but port is not open');
      return this._error(new Error('Port is not open'), callback);
    }

    factory.SerialPortBinding.drain(fd, function (err, result) {
      if (callback) {
        callback(err, result);
      } else if (err) {
        self.emit('error', err);
      }
    });
  };

  factory.SerialPort = SerialPort;
}

SerialPortFactory.prototype = Object.create(EventEmitter.prototype, {
  constructor: {
    value: SerialPortFactory
  }
});

SerialPortFactory.prototype.parsers = parsers;
SerialPortFactory.prototype.SerialPortBinding = SerialPortBinding;

if (process.platform === 'win32' || process.platform === 'darwin') {
  SerialPortFactory.prototype.list = SerialPortBinding.list;
} else {
  SerialPortFactory.prototype.list = function(callback) {
    callback = callback || function(err) {
      if (err) { this.emit('error', err) }
    }.bind(this);
    return listUnix(callback);
  };
}

module.exports = new SerialPortFactory();
