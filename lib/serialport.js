'use strict';

/**
 * @module serialport
 * @copyright Chris Williams <chris@iterativedesigns.com>
 */

// 3rd Party Dependencies
var stream = require('readable-stream');
var debug = require('debug')('serialport:main');

// Internal Dependencies
var mixInPushMethods = require('./push-methods');

// shims
var assign = require('object.assign').getPolyfill();
var inherits = require('util').inherits;

//  VALIDATION ARRAYS
var DATABITS = [5, 6, 7, 8];
var STOPBITS = [1, 1.5, 2];
var PARITY = ['none', 'even', 'mark', 'odd', 'space'];
var FLOWCONTROLS = ['xon', 'xoff', 'xany', 'rtscts'];

var defaultSettings = {
  autoOpen: true,
  baudRate: 9600,
  dataBits: 8,
  hupcl: true,
  lock: true,
  parity: 'none',
  rtscts: false,
  stopBits: 1,
  xany: false,
  xoff: false,
  xon: false,
  highWaterMark: 16 * 1024,
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
 * A callback called with an error or an object with the modem line values (cts, dsr, dcd).
 * @typedef {function} modemBitsCallback
 * @param {?error} error
 * @param {?object} status
 * @param {boolean} [status.cts=false]
 * @param {boolean} [status.dsr=false]
 * @param {boolean} [status.dcd=false]
 */

/**
 * @typedef {Object} openOptions
 * @property {module:serialport~Binding=} Binding The hardware access binding, The Binding is how node SerialPort talks to the underlying system. By default we auto detect Windows (`WindowsBinding`), Linux (`LinuxBinding`) and OSX (`DarwinBinding`) and load the appropriate module for your system.
 * @property {boolean} [autoOpen=true] Automatically opens the port on `nextTick`
 * @property {boolean} [lock=true] Prevent other processes from opening the port. false is not currently supported on windows.
 * @property {number} [baudRate=9600] The baud rate of the port to be opened. This should match one of commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200. There is no guarantee, that the device connected to the serial port will support the requested baud rate, even if the port itself supports that baud rate.
 * @property {number} [dataBits=8] Must be one of: 8, 7, 6, or 5.
 * @property {number} [stopBits=1] Must be one of: 1 or 2.
 * @property {number} [highWaterMark=16384] The size of the read and write buffers defaults to 16k
 * @property {string} [parity=none] Must be one of: 'none', 'even', 'mark', 'odd', 'space'
 * @property {boolean} [rtscts=false] flow control setting
 * @property {boolean} [xon=false] flow control setting
 * @property {boolean} [xoff=false] flow control setting
 * @property {boolean} [xany=false] flow control setting
 * @property {object=} bindingOptions sets binding specific options
 * @property {number} [bindingOptions.vmin=1] see [`man termios`](http://linux.die.net/man/3/termios) LinuxBinding and DarwinBinding
 * @property {number} [bindingOptions.vtime=0] see [`man termios`](http://linux.die.net/man/3/termios) LinuxBinding and DarwinBinding
 */

/**
 * Create a new serial port object for the `path`. In the case of invalid arguments or invalid options when constructing a new SerialPort it will throw an error. The port will open automatically by default which is the equivalent of calling `port.open(openCallback)` in the next tick. This can be disabled by setting the option `autoOpen` to false.
 * @class
 * @param {string} path - The system path of the serial port to open. For example, `/dev/tty.XXX` on Mac/Linux or `COM1` on Windows.
 * @param {module:serialport~openOptions=} options - Port configuration options
 * @param {module:serialport~errorCallback=} openCallback - Called when a connection has been opened. If this is not provided and an error occurs, it will be emitted on the ports `error` event. The callback will NOT be called if autoOpen is set to false in the openOptions as the open will not be performed.
 * @property {number} baudRate The port's baudRate, use `.update` to change it. Read Only.
 * @property {object} binding The binding object backing the port Read Only.
 * @property {boolean} isOpen `true` if the port is open, `false` otherwise. Read Only.
 * @property {string} path The system path or name of the serial port. Read Only.
 * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
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

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var settings = assign({}, defaultSettings, options);

  stream.Duplex.call(this, {
    highWaterMark: settings.highWaterMark
  });

  var Binding = settings.binding || SerialPort.Binding;

  if (!Binding) {
    throw new TypeError('No binding set, pass it as `options.binding` or set it on `SerialPort.Binding`');
  }

  if (!path) {
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

  var push = this.push.bind(this);
  var binding = new Binding({
    disconnect: this._disconnected.bind(this),
    push: push,
    readBufferSize: settings.highWaterMark,
    bindingOptions: settings.bindingOptions
  });

  binding = mixInPushMethods({
    binding: binding,
    push: push,
    readBufferSize: settings.highWaterMark
  });

  Object.defineProperties(this, {
    'binding': {
      enumerable: true,
      writable: false,
      value: binding
    },
    'path': {
      enumerable: true,
      writable: false,
      value: path
    }
  });

  this.opening = false;
  this.closing = false;
  this.settings = settings;

  if (this.settings.autoOpen) {
    this.open(callback);
  }
}

inherits(SerialPort, stream.Duplex);

Object.defineProperties(SerialPort.prototype, {
  'isOpen': {
    enumerable: true,
    get: function() {
      return this.binding.isOpen && !this.closing;
    }
  },
  'baudRate': {
    enumerable: true,
    get: function() {
      return this.settings.baudRate;
    }
  }
});

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

SerialPort.prototype._asyncError = function(error, callback) {
  process.nextTick(this._error.bind(this, error,callback));
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
    return this._asyncError(new Error('Port is already open'), callback);
  }

  if (this.opening) {
    return this._asyncError(new Error('Port is opening'), callback);
  }

  this.opening = true;
  debug('open', 'path: ' + this.path);
  this.binding.open(this.path, this.settings, function afterOpen(err) {
    this.opening = false;
    if (err) {
      debug('Binding #open had an error', err);
      return this._error(err, callback);
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
    return this._asyncError(new Error('Port is not open'), callback);
  }

  var settings = assign({}, defaultSettings, options);
  this.settings.baudRate = settings.baudRate;

  debug('update', 'baudRate: ' + settings.baudRate);
  this.binding.update(this.settings, function afterUpdate(err) {
    if (err) {
      return this._error(err, callback);
    }
    if (callback) { callback.call(this, null) }
  }.bind(this));
};

/**
 * Writes data to the given serial port. Buffers written data if the port is not open.

The write operation is non-blocking. When it returns, data may still have not actually been written to the serial port. See `drain()`.

Some devices like the Arduino reset when you open a connection to them. In these cases if you immediately write to the device they wont be ready to receive the data. This is often worked around by having the Arduino send a "ready" byte that your node program waits for before writing. You can also often get away with waiting around 400ms.

Even though serialport is a stream, when writing it can accept arrays of bytes in addition to strings and buffers. This extra functionality is pretty sweet.
 * @method module:serialport#write
 * @param  {(string|array|buffer)} data Accepts a [`Buffer` ](http://nodejs.org/api/buffer.html) object, or a type that is accepted by the `Buffer` constructor (ex. an array of bytes or a string).
 * @param  {string=} encoding The encoding, if chunk is a String. Defaults to `'utf8'`. Also accepts `'ascii'`, `'base64'`, `'binary'`, `'hex'` See [Buffers and Character Encodings](https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings) for all available options.
 * @param  {function=} callback Called once the write operation finishes. Data may not yet be flushed to the underlying port, no arguments.
 * @returns {boolean} `false` if the stream wishes for the calling code to wait for the `'drain'` event to be emitted before continuing to write additional data; otherwise `true`.
 */
var superWrite = SerialPort.prototype.write;
SerialPort.prototype.write = function(data, encoding, callback) {
  if (Array.isArray(data)) {
    data = new Buffer(data);
  }
  return superWrite.call(this, data, encoding, callback);
};

SerialPort.prototype._write = function(data, encoding, callback) {
  if (!this.isOpen) {
    return this.once('open', function afterOpenWrite() {
      this._write(data, encoding, callback);
    });
  }

  if (!Buffer.isBuffer(data)) {
    data = new Buffer(data, encoding);
  }

  debug('_write', data.length + ' bytes of data');
  this.binding.write(data, callback);
};

SerialPort.prototype._writev = function(data, callback) {
  data = data.map(function(queuedWrite) {
    if (Buffer.isBuffer(queuedWrite.chunk)) {
      return queuedWrite.chunk;
    }
    return new Buffer(queuedWrite.chunk, queuedWrite.encoding);
  });
  data = Buffer.concat(data);
  this._write(data, null, callback);
};

/**
 * Request a number of bytes from the SerialPort. The `read()` method pulls some data out of the internal buffer and returns it. If no data available to be read, null is returned. By default, the data will be returned as a Buffer object unless an encoding has been specified using the `.setEncoding()` method.
 * @method module:serialport#read
 * @param {number=} size size specify how many bytes of data to return if available.
 * @returns {(string|Buffer|null)} The data from internal buffers
 */

/**
 * The `data` event puts the port in flowing mode. data will be emitted as soon as it's received. Data will be a `Buffer` object with a varying amount of data in it. The `readLine` parser converts the data into string lines. See the [parsers](#module_serialport--SerialPort.parsers) section for more information on parsers and the [NodeJS stream documentation](https://nodejs.org/api/stream.html#stream_event_data) for more information on the data event.
 * @event module:serialport#data
 */

SerialPort.prototype._read = function(bytes) {
  if(!this.isOpen) {
    this.once('open', function afterOpenRead() {
      this.binding._read(bytes);
    });
    return;
  }
  this.binding._read(bytes);
};

/**
 * The `disconnect` event's callback is called with an error object. This will always happen before a `close` event if a disconnection is detected.
 * @event module:serialport#disconnect
 */

SerialPort.prototype._disconnected = function(err) {
  debug('disconnected with', err);
  if (!this.isOpen) {
    return;
  }
  this.emit('disconnect', err);
  this.close();
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
  if (!this.isOpen) {
    debug('close attempted, but port is not open');
    return this._asyncError(new Error('Port is not open'), callback);
  }

  this.closing = true;
  this.binding.close(function afterClose(err) {
    this.closing = false;
    if (err) {
      debug('Binding #close had an error', err);
      return this._error(err, callback);
    }
    // TODO should we be calling this.push(null) here?
    this.emit('close');
    if (callback) { callback.call(this, null) }
  }.bind(this));
};

/**
 * Set control flags on an open port. Uses [`SetCommMask`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363257(v=vs.85).aspx) for windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for mac and linux.
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
    return this._asyncError(new Error('Port is not open'), callback);
  }

  options = options || {};
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  var settings = assign({}, defaultSetFlags, options);
  debug('set', settings);
  this.binding.set(settings, function afterSet(err) {
    if (err) {
      debug('Binding #set had an error', err);
      return this._error(err, callback);
    }
    if (callback) { callback.call(this, null) }
  }.bind(this));
};

/**
 * Returns the control flags (CTS, DSR, DCD) on the open port.
 * Uses [`GetCommModemStatus`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363258(v=vs.85).aspx) for windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for mac and linux.
 * @param {module:serialport~modemBitsCallback=} callback Called once the modem bits have been retrieved.
 */
SerialPort.prototype.get = function(callback) {
  if (!this.isOpen) {
    debug('get attempted, but port is not open');
    return this._asyncError(new Error('Port is not open'), callback);
  }

  debug('get');
  this.binding.get(function afterGet(err, status) {
    if (err) {
      debug('Binding #get had an error', err);
      return this._error(err, callback);
    }
    if (callback) { callback.call(this, null, status) }
  }.bind(this));
};

/**
 * Flush discards data received but not read and written but not transmitted. For more technical details see [`tcflush(fd, TCIFLUSH)`](http://linux.die.net/man/3/tcflush) for Mac/Linux and [`FlushFileBuffers`](http://msdn.microsoft.com/en-us/library/windows/desktop/aa364439) for Windows.
 * @param  {module:serialport~errorCallback=} callback Called once the flush operation finishes.
 */
SerialPort.prototype.flush = function(callback) {
  if (!this.isOpen) {
    debug('flush attempted, but port is not open');
    return this._asyncError(new Error('Port is not open'), callback);
  }

  debug('flush');
  this.binding.flush(function afterFlush(err) {
    if (err) {
      debug('Binding #flush had an error', err);
      return this._error(err, callback);
    }
    if (callback) { callback.call(this, null) }
  }.bind(this));
};

/**
 * Waits until all output data has been transmitted to the serial port. See [`tcdrain()`](http://linux.die.net/man/3/tcdrain) or [FlushFileBuffers()](https://msdn.microsoft.com/en-us/library/windows/desktop/aa364439(v=vs.85).aspx) for more information.
 * @param {module:serialport~errorCallback=} callback Called once the drain operation returns.
 * @example
Writes `data` and waits until it has finish transmitting to the target serial port before calling the callback.

```js
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
    return this._asyncError(new Error('Port is not open'), callback);
  }
  debug('drain');
  this.binding.drain(function afterDrain(err) {
    if (err) {
      debug('Binding #drain had an error', err);
      return this._error(err, callback);
    }
    if (callback) { callback.call(this, null) }
  }.bind(this));
};

/**
 * The `pause()` method will cause a stream in flowing mode to stop emitting 'data' events, switching out of flowing mode. Any data that becomes available will remain in the internal buffer.
 * @method module:serialport#pause
 * @see module:serialport#resume
 * @returns `this`
 */

/**
 * The `resume()` method causes an explicitly paused Readable stream to resume emitting 'data' events, switching the stream into flowing mode.
 * @method module:serialport#resume
 * @see module:serialport#pause
 * @returns `this`
 */

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
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
SerialPort.list = function() {
  if (!SerialPort.Binding) {
    throw new TypeError('No Binding set on `SerialPort.Binding`');
  }
  return SerialPort.Binding.list.apply(SerialPort.Binding, arguments);
};

module.exports = SerialPort;
