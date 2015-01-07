'use strict';

// Copyright 2011 Chris Williams <chris@iterativedesigns.com>

var path = require('path'),
    os = require('os'),
    B = require('bluebird'),
    debug = require('debug')('serialport'),
    EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    util = require('util'),
    fs = B.promisifyAll(require('fs')),
    stream = require('readable-stream');

// Require serialport binding from pre-compiled binaries using
// node-pre-gyp, if something fails or package not available fallback
// to regular build from source.
var binary = require('node-pre-gyp'),
    PACKAGE_JSON = path.join(__dirname, 'package.json'),
    binding_path = binary.find(path.resolve(PACKAGE_JSON)),
    SerialPortBinding = require(binding_path);

var NOOP = function() {},
    bindable = Function.bind.bind(Function.bind),
    isWindows = os.platform() === 'win32';

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
  buffersize: 255,
  platformoptions: {
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

SerialPort.prototype.read = function(n) {
  this.read = stream.Readable.prototype.read;
  return this.read(n);
};

// Called by the Duplex Readable super class whenever data should
// be read from the transport
//
// Should `push(data)` where `data.length <= n`
//
// This function MUST NOT be called directly.
// 
SerialPort.prototype._read = function(n) {
  if(!this.isOpen()) {
    debug('queue _read after open');
    // If we're not open, start reading once we are
    // Readable logic will not call this again until previous read is fulfilled
    this.once('open', this._read.bind(this, n));
  } else {
    debug('_read', n);
    this._source.readStart();
  }
};

// Called by the Duplex Writable super class whenever data should
// be written to the transport
//
// This function MUST NOT be called directly.
// 
SerialPort.prototype._write = function (chunk, encoding, callback) {
  // If we aren't open yet, complete this write later
  // The Writable logic will buffer up any more writes while
  // waiting for this one to be done.
  if(this._opening) {
    this.once('open', function() {
      debug('queue _write after open');
      this._write(chunk, encoding, callback);
    });
  } else {
    debug('_write', this.fd, this.isOpen(), chunk, encoding, !!callback);

    if (!this.isOpen()) {
      return callback(new Error('The SerialPort must be open to write data.'));
    }

    SerialPortBinding.write(this.fd, chunk, function(err, bytesWrote) {
      debug('hardware write done', err, bytesWrote);

      callback(err);
    });
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
    if (err) {
      this._opening = false;
      debug('native open fail');
      // When opened on the same tick as creation
      // event handlers at call-site will not be attached yet
      process.nextTick(function() {
        this.emit('error', err);
      }.bind(this));
      return;
    } else {
      debug('native open succeed');
      if (isWindows) {
        this._source = new WindowsSource(fd);
        options.datacallback = this._source._dataCallback;
      } else {
        this._source = new UnixSource(fd);
      }

      this._source.ondata = function(buf) {
        debug('ondata');
        if(!this.push(buf)) {
          debug('stream asked us to stop reading');
          this._source.readStop();
        }
      }.bind(this);

      this._opening = false;
      this.fd = fd;
      this.emit('open');
    }
  }.bind(this));
};

SerialPort.prototype.isOpen = function() {
  return !!this.fd;
};

/*
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
    //self.serialPoller.close();
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
*/

/**
 * Dummy source object for windows
 */
function WindowsSource(options) {
  // The windows native code uses this to send serial
  // data whenever it arrives
  options.datacallback = function(data) {
    // No buffering here, the readable superclass should handle that
    if(this.ondata) {
      this.ondata(data);
    }
  }.bind(this);
}

WindowsSource.prototype.startRead = function() {
  this.reading = true;
};

WindowsSource.prototype.endRead = function() {
  this.reading = false;
};

/**
 * Object that represents a source of data coming from a Unix file descriptor
 */
function UnixSource(fd) {
  this.fd = fd;
  this.buffer = new Buffer(16384);
  this.totalRead = 0;
  this.totalSent = 0;
  this.reading = false;

  debug('creating serial poller');
  this.serialPoller = new SerialPortBinding.SerialportPoller(fd, function (err) {
    if (err) {
      debug('serial poller err', err);
    } else {
      debug('serial poller data available');
      this._dataAvailable();
    }
  }.bind(this));
}

/**
 * Callback to read data when it is available from the serial port
 * 
 * We use a data buffer here so that we're not wasting buffer allocations for small reads
 */
UnixSource.prototype._dataAvailable = function() {
    debug('data available');
    fs.read(this.fd, this.buffer, this.totalRead, this.buffer.length - this.totalRead, null, function (err, bytesRead) {
      if(err) {
        debug('fd read failed', err);
      } else {
        debug('fd read succeed', bytesRead);
        this.totalRead += bytesRead;
        if(this.ondata && this.reading) {
          this.ondata(this.buffer.slice(this.totalSent, this.totalRead));
          this.totalSent = this.totalRead;
        }
        
        this._ensureBuffer();
      }

      if(this.reading) {
        this.serialPoller.start();
      }
    }.bind(this));
};

/**
 * Begins data flowing from the serial port
 */
UnixSource.prototype.readStart = function() {
  if(!this.reading) {
    this.reading = true;
    this.serialPoller.start();
  }
};

/**
 * Ends data flowing from the serial port
 */
UnixSource.prototype.readStop = function() {
  this.reading = false;
};

/**
 * Ensures the buffer isn't full
 */
UnixSource.prototype._ensureBuffer = function() {
  debug('buffer freespace', this.buffer.length - this.totalRead);
  // Cycle the buffer if it fills up
  if(this.totalRead === this.buffer.length) {
    debug('buffer full');
    // If the buffer is more than half-full of unsent data, double the current buffer
    // otherwise keep the same size
    var watermark = this.totalRead - this.totalSent >= this.buffer.length / 2 ? this.buffer.length * 2 : this.buffer.length;
    var oldbuf = this.buffer;
    this.buffer = new Buffer(watermark);
    debug('new buffer length', watermark);

    // If we have unsent data, copy it from the old buffer
    if(this.totalSent < this.totalRead) {
      debug('copying leftover data to new buffer');
      oldbuf.copy(this.buffer, this.totalSent, this.totalSent + this.totalRead);
      this.totalRead = this.totalRead - this.totalSent;
      this.totalSent = 0;
    } else {
      this.totalRead = 0;
      this.totalSent = 0;
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
