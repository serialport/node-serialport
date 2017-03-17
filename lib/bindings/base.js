'use strict';

/**
 * @module serialport
 */

/**
 * @name module:serialport.Binding
 * @type {module:serialport~BaseBinding}
 * @since 5.0.0
 * @description The Binding is how node SerialPort talks to the underlying system. By default we auto detect windows, Linux and OSX and load the appropriate module for your system. You can assign `SerialPort.Binding` to any binding you like. You can find more by searching on [npm](https://npmjs.org/).
  You can also avoid auto loading the default bindings by requiring SerialPort with
  ```js
  var SerialPort = require('serialport/lib/serialport');
  SerialPort.Binding = MyBindingClass;
  ```
 */

/**
 * You wont ever have to use Binding objects directly they'll be used by SerialPort to access the underlying hardware. This documentation is geared towards people making bindings for different platforms. This class can be inherited from to get type checking for each method.
 * @class
 * @param {object} options
 * @param {function} options.disconnect - function to be called when the bindings have detected a disconnected port. This function should be called during any operation instead of that operations usual callback. The `SerialPort` class will attempt to call `close` after a disconnection and ignore any errors.
 * @property {boolean} isOpen Required property. `true` if the port is open, `false` otherwise. Should be read only.
 * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
 * @since 5.0.0
 */
class BaseBinding {
  /**
   * Retrieves a list of available serial ports with metadata. The `comName` must be guaranteed and all the other fields should be undefined if they are unavailable. The `comName` is either the path or an identifier (eg `COM1`) used to open the serialport.
   * @returns {Promise} resolves to an array of port [info objects](#module_serialport--SerialPort.list).
   */
  static list() {
    return Promise.resolve();
  }

  constructor(opt) {
    if (typeof opt !== 'object') {
      throw new TypeError('"options" is not an object');
    }
    if (typeof opt.disconnect !== 'function') {
      throw new TypeError('"options.disconnect" is not a function');
    }
  }

  /**
   * Opens a connection to the serial port referenced by the path.
   * @param {string} path
   * @param {module:serialport~openOptions} openOptions
   * @returns {Promise} Resolves after the port has been opened and configured.
   * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
   */
  open(path, options) {
    if (!path) {
      throw new TypeError('"path" is not a valid port');
    }

    if (typeof options !== 'object') {
      throw new TypeError('"options" is not an object');
    }

    if (this.isOpen) {
      return Promise.reject(new Error('Already open'));
    }
    return Promise.resolve();
  }

  /**
   * Closes an open connection
   * @returns {Promise} Resolves once the connection is closed.
   * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
   */
  close() {
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'));
    }
    return Promise.resolve();
  }

  /**
   * Request a number of bytes from the SerialPort. This function is similar to node's [`fs.read`](http://nodejs.org/api/fs.html#fs_fs_read_fd_buffer_offset_length_position_callback).
   * @param {buffer} data - Accepts a [`Buffer`](http://nodejs.org/api/buffer.html) object.
   * @params {integer} offset - is the offset in the buffer to start writing at.
   * @param {integer} length - specifying the maximum number of bytes to read.
   * @returns {Promise} Resolves with the number of bytes read after a read operation.
   * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
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

    if (buffer.length < offset + length) {
      return Promise.reject(new Error('buffer is too small'));
    }

    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'));
    }
    return Promise.resolve();
  }

  /**
   * Write a number of bytes to the SerialPort This will only be called when there isn't a pending write operation.
   * @param {buffer} data - Accepts a [`Buffer`](http://nodejs.org/api/buffer.html) object.
   * @returns {Promise} Resolves after the data has been passed to the operating system for writing.
   * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
   */
  write(buffer) {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('"buffer" is not a Buffer');
    }

    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'));
    }
    return Promise.resolve();
  }

  /**
   * Changes connection settings on an open port. Currently only the baudRate is required.
   * @param {object=} options Only `baudRate` is currently supported
   * @param {number=} [options.baudRate] If provided a baudRate that isn't supported by the bindings it should pass an error to the callback
   * @returns {Promise} Resolves once the port's baud rate has been changed.
   * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
   */
  update(options) {
    if (typeof options !== 'object') {
      throw TypeError('"options" is not an object');
    }

    if (typeof options.baudRate !== 'number') {
      throw new TypeError('"options.baudRate" is not a number');
    }

    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'));
    }
    return Promise.resolve();
  }

  /**
   * Set control flags on an open port.
   * @param {object=} options All options are operating system default when the port is opened. Every flag is set on each call to the provided or default values. All options will always be provided.
   * @param {Boolean} [options.brk=false]
   * @param {Boolean} [options.cts=false]
   * @param {Boolean} [options.dsr=false]
   * @param {Boolean} [options.dtr=true]
   * @param {Boolean} [options.rts=true]
   * @returns {Promise} Resolves once the port's flags have been set.
   * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
   */
  set(options) {
    if (typeof options !== 'object') {
      throw new TypeError('"options" is not an object');
    }

    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'));
    }
    return Promise.resolve();
  }

  /**
   * Get the control flags (CTS, DSR, DCD) on the open port.
   * @returns {Promise} Resolves with the flags that have been retrieved.
   * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
   */
  get() {
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'));
    }
    return Promise.resolve();
  }

  /**
   * Flush (discard) data received but not read and written but not transmitted.
   * @returns {Promise} Resolves once the flush operation finishes.
   * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
   */
  flush() {
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'));
    }
    return Promise.resolve();
  }

  /**
   * Drain waits until all output data has been transmitted to the serial port.
   * @returns {Promise} Resolves once the drain operation finishes.
   * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
   */
  drain() {
    if (!this.isOpen) {
      return Promise.reject(new Error('Port is not open'));
    }
    return Promise.resolve();
  }
}

module.exports = BaseBinding;
