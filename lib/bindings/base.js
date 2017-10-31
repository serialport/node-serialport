'use strict';
const debug = require('debug')('serialport:bindings');

/**
 * @name module:serialport.Binding
 * @type {module:serialport~BaseBinding}
 * @since 5.0.0
 * @description The `Binding` is how Node-SerialPort talks to the underlying system. By default, we auto detect Windows, Linux and OS X, and load the appropriate module for your system. You can assign `SerialPort.Binding` to any binding you like. Find more by searching at [npm](https://npmjs.org/).
  Prevent auto loading the default bindings by requiring SerialPort with:
  ```js
  var SerialPort = require('serialport/lib/serialport');
  SerialPort.Binding = MyBindingClass;
  ```
 */

/**
 * You never have to use `Binding` objects directly. SerialPort uses them to access the underlying hardware. This documentation is geared towards people who are making bindings for different platforms. This class can be inherited from to get type checking for each method.
 * @class BaseBinding
 * @param {object} options
 * @property {boolean} isOpen Required property. `true` if the port is open, `false` otherwise. Should be read-only.
 * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
 * @since 5.0.0
 */
class BaseBinding {
  /**
   * Retrieves a list of available serial ports with metadata. The `comName` must be guaranteed, and all other fields should be undefined if unavailable. The `comName` is either the path or an identifier (eg `COM1`) used to open the serialport.
   * @returns {Promise} resolves to an array of port [info objects](#module_serialport--SerialPort.list).
   */
  static list() {
    debug('list');
    return Promise.resolve();
  }

  constructor(opt) {
    if (typeof opt !== 'object') {
      throw new TypeError('"options" is not an object');
    }
  }

  /**
   * Opens a connection to the serial port referenced by the path.
   * @param {string} path
   * @param {module:serialport~openOptions} openOptions
   * @returns {Promise} Resolves after the port is opened and configured.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  open(path, options) {
    if (!path) {
      throw new TypeError('"path" is not a valid port');
    }

    if (typeof options !== 'object') {
      throw new TypeError('"options" is not an object');
    }
    debug('open');

    if (this.isOpen) {
      return Promise.reject(new Error('Already open'));
    }
    return Promise.resolve();
  }

  /**
   * Closes an open connection
   * @returns {Promise} Resolves once the connection is closed.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  close() {
    debug('close');
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'));
    }
    return Promise.resolve();
  }

  /**
   * Request a number of bytes from the SerialPort. This function is similar to Node's [`fs.read`](http://nodejs.org/api/fs.html#fs_fs_read_fd_buffer_offset_length_position_callback) except it will always return at least one byte.

The in progress reads must error when the port is closed with an error object that has the property `canceled` equal to `true`. Any other error will cause a disconnection.

   * @param {buffer} data Accepts a [`Buffer`](http://nodejs.org/api/buffer.html) object.
   * @param {integer} offset The offset in the buffer to start writing at.
   * @param {integer} length Specifies the maximum number of bytes to read.
   * @returns {Promise} Resolves with the number of bytes read after a read operation.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  read(buffer, offset, length) {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('"buffer" is not a Buffer');
    }

    if (typeof offset !== 'number') {
      throw new TypeError('"offset" is not an integer');
    }

    if (typeof length !== 'number') {
      throw new TypeError('"length" is not an integer');
    }

    debug('read');
    if (buffer.length < offset + length) {
      return Promise.reject(new Error('buffer is too small'));
    }

    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'));
    }
    return Promise.resolve();
  }

  /**
   * Write bytes to the SerialPort. Only called when there is no pending write operation.

The in progress writes must error when the port is closed with an error object that has the property `canceled` equal to `true`. Any other error will cause a disconnection.

   * @param {buffer} data - Accepts a [`Buffer`](http://nodejs.org/api/buffer.html) object.
   * @returns {Promise} Resolves after the data is passed to the operating system for writing.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  write(buffer) {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('"buffer" is not a Buffer');
    }

    debug('write', buffer.length, 'bytes');
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'));
    }
    return Promise.resolve();
  }

  /**
   * Changes connection settings on an open port. Only `baudRate` is supported.
   * @param {object=} options Only supports `baudRate`.
   * @param {number=} [options.baudRate] If provided a baud rate that the bindings do not support, it should pass an error to the callback.
   * @returns {Promise} Resolves once the port's baud rate changes.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  update(options) {
    if (typeof options !== 'object') {
      throw TypeError('"options" is not an object');
    }

    if (typeof options.baudRate !== 'number') {
      throw new TypeError('"options.baudRate" is not a number');
    }

    debug('update');
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'));
    }
    return Promise.resolve();
  }

  /**
   * Set control flags on an open port.
   * @param {object=} options All options are operating system default when the port is opened. Every flag is set on each call to the provided or default values. All options are always provided.
   * @param {Boolean} [options.brk=false]
   * @param {Boolean} [options.cts=false]
   * @param {Boolean} [options.dsr=false]
   * @param {Boolean} [options.dtr=true]
   * @param {Boolean} [options.rts=true]
   * @returns {Promise} Resolves once the port's flags are set.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  set(options) {
    if (typeof options !== 'object') {
      throw new TypeError('"options" is not an object');
    }
    debug('set');
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'));
    }
    return Promise.resolve();
  }

  /**
   * Get the control flags (CTS, DSR, DCD) on the open port.
   * @returns {Promise} Resolves with the retrieved flags.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  get() {
    debug('get');
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'));
    }
    return Promise.resolve();
  }

  /**
   * Flush (discard) data received but not read, and written but not transmitted.
   * @returns {Promise} Resolves once the flush operation finishes.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  flush() {
    debug('flush');
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'));
    }
    return Promise.resolve();
  }

  /**
   * Drain waits until all output data is transmitted to the serial port. An in progress write should be completed before this returns.
   * @returns {Promise} Resolves once the drain operation finishes.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  drain() {
    debug('drain');
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'));
    }
    return Promise.resolve();
  }
}

module.exports = BaseBinding;
