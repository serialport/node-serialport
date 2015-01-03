'use strict';

// Copyright 2011 Chris Williams <chris@iterativedesigns.com>

// Require serialport binding from pre-compiled binaries using
// node-pre-gyp, if something fails or package not available fallback
// to regular build from source.

var path = require('path'),
    os = require('os'),
    B = require('bluebird'),
    binary = require('node-pre-gyp'),
    PACKAGE_JSON = path.join(__dirname, 'package.json'),
    binding_path = binary.find(path.resolve(PACKAGE_JSON)),
    debug = require('debug')('serialport'),
    SerialPortBinding = require(binding_path);

var EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    util = require('util'),
    fs = B.promisifyAll(require('fs')),
    stream = require('readable-stream'),
    NOOP = function() {};

var bindable = Function.bind.bind(Function.bind);

var isWindows = os.platform() === 'win32';

//
//  VALIDATION ARRAYS
var DATABITS = [5, 6, 7, 8];
var STOPBITS = [1, 1.5, 2];
var PARITY = ['none', 'even', 'mark', 'odd', 'space'];
var FLOWCONTROLS = ['xon', 'xoff', 'xany', 'rtscts'];
var SETS = ['rts', 'cts', 'dtr', 'dts'];

// The default options, can be overwritten in the 'SerialPort' constructor
var defaultOptions = {
  baudrate: 9600,
  parity: 'none',
  rtscts: false,
  xon: false,
  xoff: false,
  xany: false,
  rts: false,
  cts: false,
  dtr: false,
  dts: false,
  databits: 8,
  stopbits: 1,
  platformOptions: {
    vmin: 1,
    vtime: 0
  }
};

function verifyEnumOption(value, name, enums) {
  debug('validating enum %s[%s](%s)', name, enums, value);
  if (enums.indexOf(value) === -1) {
    debug('invalid enum value');
    throw new Error('Invalid "' + name + '": ' + value);
  }
}

exports.open = exports.openPort = function openPort(options, cb) {
  var port = new SerialPort(options);
  port.open(options, cb);
  return port;
};

function SerialPort(options) {
  debug('construct');

  if(!_.isObject(options)) {
    options = {};
  }

  stream.Duplex.call(this, options);

  this.fd = null;
}
util.inherits(SerialPort, stream.Duplex);
exports.SerialPort = SerialPort;


// On first read, start up the poller
SerialPort.prototype.read = function(n) {

  this.read = stream.Readable.prototype.read;
};

// Called by the Duplex Readable super class whenever data should
// be read from the transport
//
// This function MUST NOT be called directly.
// 
// Should `push(data)` where `data.length <= n`
SerialPort.prototype._read = function(n) {
  if(this._connecting || !this.isOpen()) {
    debug('_read after open');
    // If we're not open, start reading once we are
    // Readable logic will not call this again until previous read is fulfilled
    this.once('open', this._read.bind(this, n));
  } else {
    var buf = new Buffer(n);
    fs.read(this.fd, buf, 0, buf.length, null, function (err, bytesRead) {
      // Push the number of bytes read into the stream
      if(this.push(buf.slice(bytesRead))) {
        // If push returns true; play it again, Sam.
        this._read();
      }
    }.bind(this));
  }
};

// Called by the Duplex Writable super class whenever data should
// be written to the transport
//
// This function MUST NOT be called directly.
// 
SerialPort.prototype._write = function (chunk, encoding, callback) {
  // If we aren't open yet, complet this write later
  // The Writable logic will buffer up any more writes while
  // waiting for this one to be done.
  if(this._connecting) {
    this.once('open', function() {
      debug('_write after open');
      this._write.apply(this, arguments);
    });
  } else {
    debug('_write');

    if (!this.isOpen()) {
      throw new Error('The SerialPort must be open to write data.');
    }

    SerialPortBinding.write(this.fd, chunk, callback);
  }
};


function processOptions(options) {
  debug('processing open options');
  // Lowercase all of the option properties to make them case insensitive
  options = _.transform(options, function(res, val, key) {
    res[key.toLowerCase()] = val;
  });

  debug('options before merge', options);
  // Merge the default options
  options = _.defaults(options, defaultOptions);
  debug('options after merge', options);

  // Validate inputs
  verifyEnumOption(options.databits, 'databits', DATABITS);
  verifyEnumOption(options.stopbits, 'stopbits', STOPBITS);
  verifyEnumOption(options.parity, 'parity', PARITY);

  if (options.flowcontrol) {
    if (_.isBoolean(options.flowcontrol)) {
      debug('enabled rtscts');
      options.rtscts = true;
    } else {
      options.flowcontrol = _.isArray(options.flowcontrol) ? options.flowcontrol : [options.flowcontrol];
      options.flowcontrol.forEach(function(flowControl) {
        flowControl = flowControl.toLowerCase();
        verifyEnumOption(flowControl, 'flowcontrol', FLOWCONTROLS);
        options[flowControl] = true;
        debug('enabled ' + flowControl);
      });
    }
  }

  return options;
}

SerialPort.prototype.open = function(options, cb) {
  // Allow specifying comname as first param
  if(!_.isObject(options)) {
    options = { comname: options };
  }

  try {
  this.options = processOptions(options);
  } catch(err) {
    process.nextTick(function() {
      this.emit('error', err);
    }.bind(this));
    return;
  }
  
  if(_.isFunction(cb)) {
    this.once('open', cb);
  }

  this._opening = true;
  debug('opening port');
  SerialPortBinding.open(this.options.comname, this.options, function (err, fd) {
    this._opening = false;

    if (err) {
      debug('native open fail');
      // When opened on the same tick as creation
      // event handlers at call-site will not be attached yet
      process.nextTick(function() {
        this.emit('error', err);
      }.bind(this));
      return;
    } else {
      debug('native open succeed');
      if (!isWindows) {
        debug('starting serial poller');
        this.serialPoller = new SerialPortBinding.SerialportPoller(fd, function (err) {
          if (err) {
            debug('serial poller err', err);
          } else {
            debug('serial poller started');
          }
        });
        this.serialPoller.start();
      }

      this.fd = fd;
      this.emit('open');
    }
  }.bind(this));
};


SerialPort.prototype.isOpen = function() {
  return !!this.fd;
};

if (!isWindows) {
  /*
  SerialPort.prototype._read = function () {
    var self = this;

    // console.log(">>READ");
    if (!self.readable || self.paused || self.reading) {
      return;
    }

    self.reading = true;

    if (!self.pool || self.pool.length - self.pool.used < kMinPoolSpace) {
      // discard the old pool. Can't add to the free list because
      // users might have refernces to slices on it.
      self.pool = null;

      // alloc new pool
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
          if (self.fd >= 0) {
            self.serialPoller.start();
          }
        } else if (err.code && (err.code === 'EBADF' || err.code === 'ENXIO' || (err.errno === -1 || err.code === 'UNKNOWN'))) { // handle edge case were mac/unix doesn't clearly know the error.
          self.disconnected(err);
        } else {
          self.fd = null;
          self.emit('error', err);
          self.readable = false;
        }
      } else {
        // Since we will often not read the number of bytes requested,
        // let's mark the ones we didn't need as available again.
        self.pool.used -= bytesRequested - bytesRead;

        if (bytesRead === 0) {
          if (self.fd >= 0) {
            self.serialPoller.start();
          }
        } else {
          var b = self.pool.slice(start, start + bytesRead);

          // do not emit events if the stream is paused
          if (self.paused) {
            self.buffer = Buffer.concat([self.buffer, b]);
            return;
          } else {
            self._emitData(b);
          }

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
*/
} // if !'win32'


SerialPort.prototype.disconnected = function (err) {
  // send notification of disconnect
  if (this.options.disconnectedcallback) {
    this.options.disconnectedcallback.call(this, err);
  } else {
    this.emit('disconnect', err);
  }
  this.paused = true;
  this.closing = true;

  this.emit('close');

  try {
    SerialPortBinding.close(this.fd, function (err) {
      if (err) {
        console.log('Disconnect completed with error:' + err);
      } else {
        console.log('Disconnect completed');
      }
    });
  } catch (e) {
    console.log('Disconnect failed with exception', e);
  }

  this.removeAllListeners();
  this.closing = false;
  this.fd = 0;

  if (!isWindows) {
    this.readable = false;
    this.serialPoller.close();
  }

};


SerialPort.prototype.end = SerialPort.prototype.close = function (callback) {
  var self = this;

  var fd = self.fd;

  if (self.closing) {
    return;
  }
  if (!fd) {
    var err = new Error('Serialport not open.');
    if (callback) {
      callback(err);
    } else {
      // console.log("sp not open");
      self.emit('error', err);
    }
    return;
  }

  self.closing = true;

  // Stop polling before closing the port.
  if (!isWindows) {
    self.readable = false;
    self.serialPoller.close();
  }

  try {
    SerialPortBinding.close(fd, function (err) {

      if (err) {
        if (callback) {
          callback(err);
        } else {
          // console.log("doclose");
          self.emit('error', err);
        }
        return;
      }

      self.emit('close');
      self.removeAllListeners();
      self.closing = false;
      self.fd = 0;

      if (callback) {
        callback();
      }
    });
  } catch (ex) {
    self.closing = false;
    if (callback) {
      callback(ex);
    } else {
      self.emit('error', ex);
    }
  }
};

SerialPort.prototype.flush = function (callback) {
  var self = this;
  var fd = self.fd;

  if (!fd) {
    var err = new Error('Serialport not open.');
    if (callback) {
      callback(err);
    } else {
      self.emit('error', err);
    }
    return;
  }

  SerialPortBinding.flush(fd, function (err, result) {
    if (err) {
      if (callback) {
        callback(err, result);
      } else {
        self.emit('error', err);
      }
    } else {
      if (callback) {
        callback(err, result);
      }
    }
  });
};

SerialPort.prototype.set = function (options, callback) {
  var self = this;

  options = (!_.isFunction(options)) && options || {};
  options = _.merge(options, defaultOptions);

  if (this.isOpen()) {
    SerialPortBinding.set(this.fd, options, function (err, result) {
      if (err) {
        if (callback) {
          callback(err, result);
        } else {
          self.emit('error', err);
        }
      } else {
        callback(err, result);
      }
    });
  } else {
    var err = new Error('Serialport not open.');
    if (callback) {
      callback(err);
    } else {
      this.emit('error', err);
    }
  }
};

SerialPort.prototype.drain = function (callback) {
  if (this.isOpen()) {
    SerialPortBinding.drain(this.fd, function (err, result) {
      if (err) {
        if (callback) {
          callback(err, result);
        } else {
          this.emit('error', err);
        }
      } else {
        if (callback) {
          callback(err, result);
        }
      }
    }.bind(this));
  } else {
    var err = new Error('Serialport not open.');
    if (callback) {
      callback(err);
    } else {
      this.emit('error', err);
    }
  }
};

function listUnix() {
  var dirName = '/dev/serial/by-id';

  var join = bindable(path.join);

  return fs.readdirAsync(dirName)
    .map(join(dirName))
    .map(fs.realpathAsync)
    .map(function(realPath) {
      return {
        comName: realPath,
        manufactuer: undefined,
        pnpId: path.basename(realPath)
      };
    });
}

// Patch in this javascript /dev list impl for Unix
if(!isWindows && os.platform() !== 'darwin') {
  exports.list = listUnix;
} else {
  // Promisify the native binding
  exports.list = B.promisify(SerialPortBinding.list, SerialPortBinding);
}

exports.SerialPortBinding = SerialPortBinding;
exports.transforms = require('./transforms');
