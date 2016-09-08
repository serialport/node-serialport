'use strict';

/**
 * @module serialport
 * @copyright Chris Williams <chris@iterativedesigns.com>
 */

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

/**
 * A callback called with an error or null.
 * @typedef {function} errorCallback
 * @param {?error} error
 */

/**
 * @typedef {Object} openOptions
 * @property {boolean} [autoOpen=true] - Automatically opens the port on `nextTick`
 * @property {boolean} [lock=true] Prevent other processes from opening the port. false is not currently supported on windows.
 * @property {number} [baudRate=9600] The baud rate of the port to be opened. This should match one of commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200. There is no guarantee, that the device connected to the serial port will support the requested baud rate, even if the port itself supports that baud rate.
 * @property {number} [dataBits=8] Must be one of: 8, 7, 6, or 5.
 * @property {number} [stopBits=1] Must be one of: 1 or 2.
 * @property {string} [parity=none] Must be one of: 'none', 'even', 'mark', 'odd', 'space'
 * @property {boolean} [rtscts=false] flow control setting
 * @property {boolean} [xon=false] flow control setting
 * @property {boolean} [xoff=false] flow control setting
 * @property {boolean} [xany=false] flow control setting
 * @property {number} [bufferSize=65536] Size of read buffer
 * @property {function} [parser=Parsers.raw] The parser to transform read data, defaults to the `raw` parser that emits data as it's received.
 * @property {object=} platformOptions sets platform specific options
 * @property {number} [platformOptions.vmin=1] see [`man termios`](http://linux.die.net/man/3/termios)
 * @property {number} [platformOptions.vtime=0] see [`man termios`](http://linux.die.net/man/3/termios)
 */

/**
 * Creates a SerialPort Object.
 * @class
 * @description Create a new serial port object for the `path`. In the case of invalid arguments or invalid options when constructing a new SerialPort it will throw an error. The port will open automatically by default which is the equivalent of calling `port.open(openCallback)` in the next tick. This can be disabled by setting the option `autoOpen` to false.
 * @param {string} path - The system path of the serial port to open. For example, `/dev/tty.XXX` on Mac/Linux or `COM1` on Windows.
 * @param {module:serialport~openOptions=} options - Port configuration options
 * @param {module:serialport~errorCallback=} openCallback - Called when a connection has been opened. If this is not provided and an error occurs, it will be emitted on the ports `error` event. The callback will NOT be called if autoOpen is set to false in the openOptions as the open will not be performed.
 * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
 * @property {string} path The system path or name of the serial port. Read Only.
 * @property {boolean} isOpen true if the port is open, false otherwise. Read Only.
 * @emits module:serialport#open
 * @emits module:serialport#data
 * @emits module:serialport#close
 * @emits module:serialport#error
 * @emits module:serialport#disconnect
 * @alias module:serialport
 */
function SerialPort(path, options, callback) {
  if (!(this instanceof SerialPort)) {
    return new SerialPort(path, options, callback);
  }

  stream.Stream.call(this);

  if (typeof callback === 'boolean' || typeof options === 'boolean') {
    throw new TypeError('`openImmediately` is now called `autoOpen` and is a property of options');
  }

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var settings = assign({}, defaultSettings, options);

  Object.defineProperty(this, 'path', {
    enumerable: true,
    writable: false,
    value: path
  });

  Object.defineProperty(this, 'isOpen', {
    enumerable: true,
    get: function() {
      return this.fd !== null && !this.closing;
    }
  });

  if (!this.path) {
    throw new TypeError('No path specified');
  }

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

/**
 * The `data` event's callback is called with data depending on your chosen parser. The default `raw` parser will have a `Buffer` object with a varying amount of data in it. The `readLine` parser will provide a string of a received ASCII line. See the [parsers](#parsers) section for more information.
 * @event module:serialport#data
 */

/**
 * The `error` event's callback is called with an error object whenever there is an error.
 * @event module:serialport#error
 */

SerialPort.prototype._error = function(error, callback) {
  if (callback) {
    callback.call(this, error);
  } else {
    this.emit('error', error);
  }
};

/**
 * The `open` event's callback is called with no arguments when the port is opened and ready for writing. This happens if you have the constructor open immediately (which opens in the next tick) or if you open the port manually with `open()`. See [Useage/Opening a Port](#opening-a-port) for more information.
 * @event module:serialport#open
 */

/**
 * Opens a connection to the given serial port.
 * @param {module:serialport~errorCallback=} callback - Called when a connection has been opened. If this is not provided and an error occurs, it will be emitted on the ports `error` event.
 * @emits module:serialport#open
 */
SerialPort.prototype.open = function(callback) {
  if (this.isOpen) {
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
    this.opening = false;
    if (err) {
      debug('SerialPortBinding.open had an error', err);
      return this._error(err, callback);
    }
    this.fd = fd;
    this.paused = false;

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

/**
 * Changes the baud rate for an open port. Throws if you provide a bad argument. Emits an error or calls the callback if the baud rate isn't supported.
 * @param {object=} options Only `baudRate` is currently supported
 * @param {number=} [options.baudRate] The baud rate of the port to be opened. This should match one of commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200. There is no guarantee, that the device connected to the serial port will support the requested baud rate, even if the port itself supports that baud rate.
 * @param {module:serialport~errorCallback=} [callback] Called once the port's baud rate has been changed. If `.update` is called without an callback and there is an error, an error event will be emitted.
 */
SerialPort.prototype.update = function(options, callback) {
  if (!this.isOpen) {
    debug('update attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  var settings = assign({}, defaultSettings, options);
  this.options.baudRate = settings.baudRate;

  SerialPortBinding.update(this.fd, this.options, function(err) {
    if (err) {
      return this._error(err, callback);
    }
    if (callback) { callback.call(this, null) }
  }.bind(this));
};

/**
 * Writes data to the given serial port.
 * @param  {(string|array|buffer)} data Accepts a [`Buffer` ](http://nodejs.org/api/buffer.html) object, or a type that is accepted by the `Buffer` constructor (ex. an array of bytes or a string).
 * @param  {module:serialport~errorCallback=} callback Called once the write operation returns.
 * @description The write operation is non-blocking. When it returns, data may still have not actually been written to the serial port. See `drain()`.
 * @description Some devices like the Arduino reset when you open a connection to them. In these cases if you immediately write to the device they wont be ready to receive the data. This is often worked around by having the Arduino send a "ready" byte that your node program waits for before writing. You can also often get away with waiting around 400ms.
 */
SerialPort.prototype.write = function(data, callback) {
  if (!this.isOpen) {
    debug('write attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  if (!Buffer.isBuffer(data)) {
    data = new Buffer(data);
  }

  debug('write ' + data.length + ' bytes of data');
  SerialPortBinding.write(this.fd, data, function(err) {
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
          if (this.isOpen) {
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
        if (this.isOpen) {
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


  /**
   * Pauses an open connection (unix only)
   */
  SerialPort.prototype.pause = function() {
    this.paused = true;
  };

  /**
   * Resumes a paused connection (unix only)
   */
  SerialPort.prototype.resume = function() {
    this.paused = false;

    if (this.buffer) {
      var buffer = this.buffer;
      this.buffer = null;
      this._emitData(buffer);
    }

    // No longer open?
    if (!this.isOpen) {
      return;
    }

    this._read();
  };
} // if !'win32'

/**
 * The `disconnect` event's callback is called with an error object. This will always happen before a `close` event if a disconnection is detected.
 * @event module:serialport#disconnect
 */

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

/**
 * The `close` event's callback is called with no arguments when the port is closed. In the event of an error, an error event will be triggered
 * @event module:serialport#close
 */

/**
 * Closes an open connection
 * @param  {errorCallback} callback Called once a connection is closed.
 * @emits module:serialport#close
 */
SerialPort.prototype.close = function(callback) {
  this.paused = true;

  if (this.closing) {
    debug('close attempted, but port is already closing');
    return this._error(new Error('Port is not open'), callback);
  }

  if (!this.isOpen) {
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

/**
 * Sets flags on an open port. Uses [`SetCommMask`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363257(v=vs.85).aspx) for windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for mac and linux.
 * @param {object=} options All options are operating system default when the port is opened. Every flag is set on each call to the provided or default values. If options isn't provided default options will be used.
 * @param {Boolean} [options.brk=false]
 * @param {Boolean} [options.cts=false]
 * @param {Boolean} [options.dsr=false]
 * @param {Boolean} [options.dtr=true]
 * @param {Boolean} [options.rts=true]
 * @param {module:serialport~errorCallback=} callback Called once the port's flags have been set.
 */
SerialPort.prototype.set = function(options, callback) {
  if (!this.isOpen) {
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

/**
 * Flush discards data received but not read and written but not transmitted. For more technical details see [`tcflush(fd, TCIFLUSH)`](http://linux.die.net/man/3/tcflush) for Mac/Linux and [`FlushFileBuffers`](http://msdn.microsoft.com/en-us/library/windows/desktop/aa364439) for Windows.
 * @param  {module:serialport~errorCallback=} callback Called once the flush operation finishes.
 */
SerialPort.prototype.flush = function(callback) {
  if (!this.isOpen) {
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

/**
 * Waits until all output data has been transmitted to the serial port. See [`tcdrain()`](http://linux.die.net/man/3/tcdrain) or [FlushFileBuffers()](https://msdn.microsoft.com/en-us/library/windows/desktop/aa364439(v=vs.85).aspx) for more information.
 * @param {module:serialport~errorCallback=} callback Called once the drain operation returns.
 * @example
Writes `data` and waits until it has finish transmitting to the target serial port before calling the callback.

```
function writeAndDrain (data, callback) {
  sp.write(data, function () {
    sp.drain(callback);
  });
}
```
 */
SerialPort.prototype.drain = function(callback) {
  if (!this.isOpen) {
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

/**
 * Parsers will process incoming data in a variety of ways and are meant to be passed to a port during construction.
 * @type {object}
 * @property {function} [raw] emits a raw buffer as a data event as it's received. This is the default parser.
 * @property {function} [readline] returns a function that emits a string as a data event after a newline delimiter is received.
 * @property {function} [byteLength] returns a function that emits a data event as a buffer after a specific number of bytes are received.
 * @property {function} [byteDelimiter] returns a function that emits a data event each time a byte sequence (an array of bytes) is received.
 * @example
To use the readline parser, you must provide a delimiter as such:

```js
var SerialPort = require('serialport');

var port = new SerialPort('/dev/tty-usbserial1', {
  parser: SerialPort.parsers.readline('\n')
});
```

To use the raw parser don't specify any parser, however if you really want to you can:

```js
var SerialPort = require('serialport');

var port = new SerialPort('/dev/tty-usbserial1', {
  parser: SerialPort.parsers.raw
});
```

Note that the raw parser does not guarantee that all data it receives will come in a single event.

To use the byte sequence parser, you must provide a delimiter as an array of bytes:
```js
var SerialPort = require('serialport');

var port = new SerialPort('/dev/tty-usbserial1', {
  parser: SerialPort.parsers.byteDelimiter([10,13])
});
```

To use the byte length parser, you must provide a delimiter as a length in bytes:
```js
var SerialPort = require('serialport');

var port = new SerialPort('/dev/tty-usbserial1', {
  parser: SerialPort.parsers.byteLength(5)
});
```
 */

SerialPort.parsers = parsers;

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback listCallback
 * @param {?error} error
 * @param {array} ports an array of objects with port info.
 */

/**
 * Retrieves a list of available serial ports with metadata. Only the `comName` is guaranteed, all the other fields will be undefined if they are unavailable. The `comName` is either the path or an identifier (eg `COM1`) used to open the serialport.
 * @type {function}
 * @param {listCallback} callback
 * @example
```js
// example port information
{
  comName: '/dev/cu.usbmodem1421',
  manufacturer: 'Arduino (www.arduino.cc)',
  serialNumber: '757533138333964011C1',
  pnpId: undefined,
  locationId: '0x14200000',
  vendorId: '0x2341',
  productId: '0x0043'
}

```

```js
var SerialPort = require('serialport');
SerialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});
```
 */
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
