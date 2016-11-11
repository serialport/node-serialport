'use strict';

var debug = require('debug')('serialport:binding');

/**
 * @module serialport
 */

/**
 * @name module:serialport.Binding
 * @type {module:serialport~Binding}
 * @description The Binding is how node SerialPort talks to the underlying system. By default we auto detect windows, Linux and OSX and load the appropriate module for your system. You can assign `SerialPort.Binding` to any backend you like. You can find more by searching on [npm](https://npmjs.org/).

  You can also avoid auto loading the default backends by requiring SerialPort with
  ```js
  var SerialPort = require('serialport/lib/serialport');
  SerialPort.Binding = MyBindingClass;
  ```
 */

switch (process.platform) {
  case 'win32':
    debug('loading WindowsBinding');
    module.exports = require('./bindings-win32');
    break;
  case 'darwin':
    debug('loading DarwinBinding');
    module.exports = require('./bindings-darwin');
    break;
  default:
    debug('loading LinuxBinding');
    module.exports = require('./bindings-linux');
}

/**
 * You wont ever have to use Binding objects directly they'll be used by SerialPort to access the underlying hardware. This documentation is geared towards people making bindings for different platforms.
 * @typedef {Class} Binding
 * @class
 * @param {object} options
 * @param {function} options.disconnect - function to be called when the bindings have detected a disconnected port. This function should be called during any operation instead of that operations usual callback. The `SerialPort` class will attempt to call `close` after a disconnection and ignore any errors.
 * @property {boolean} isOpen Required property. `true` if the port is open, `false` otherwise. Should be read only.
 * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
 */

/**
 * Retrieves a list of available serial ports with metadata. The `comName` must be guaranteed and all the other fields should be undefined if they are unavailable. The `comName` is either the path or an identifier (eg `COM1`) used to open the serialport.
 * @method module:serialport~Binding#list
 * @param {module:serialport~listCallback} callback
 */

/**
 * Opens a connection to the serial port referenced by the path.
 * @method module:serialport~Binding#open
 * @param {string} path
 * @param {module:serialport~openOptions} openOptions
 * @param {module:serialport~errorCallback} openCallback - is called after the data has been passed to the operating system for writing. This will only be called when there isn't a pending write operation.
 * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
 */

/**
 * Closes an open connection
 * @method module:serialport~Binding#close
 * @param {module:serialport~errorCallback} callback Called once a connection is closed.
 * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
 */

/**
 * Request a number of bytes from the SerialPort. This function is similar to node's [`fs.read`](http://nodejs.org/api/fs.html#fs_fs_read_fd_buffer_offset_length_position_callback).
 * @method module:serialport~Binding#read
 * @param {buffer} data - Accepts a [`Buffer`](http://nodejs.org/api/buffer.html) object.
 * @params {integer} offset - is the offset in the buffer to start writing at.
 * @param {integer} length - specifying the maximum number of bytes to read.
 * @param {module:serialport~readCallback} readCallback - is called after a read operation
 * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
 */

/**
 * A callback called with an error or null.
 * @typedef {function} module:serialport~readCallback
 * @param {?error} error
 * @param {integer} bytesRead - the number of bytes that have been written into the buffer
 * @param {buffer} buffer - the buffer that data was written into, same object that was passed into `read`.
 * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
*/

/**
 * Write a number of bytes to the SerialPort
 * @method module:serialport~Binding#write
 * @param {buffer} data - Accepts a [`Buffer`](http://nodejs.org/api/buffer.html) object.
 * @param {module:serialport~errorCallback} writeCallback - is called after the data has been passed to the operating system for writing. This will only be called when there isn't a pending write operation.
 * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
 */

/**
 * Set control flags on an open port.
 * @method module:serialport~Binding#set
 * @param {object=} options All options are operating system default when the port is opened. Every flag is set on each call to the provided or default values. All options will always be provided.
 * @param {Boolean} [options.brk=false]
 * @param {Boolean} [options.cts=false]
 * @param {Boolean} [options.dsr=false]
 * @param {Boolean} [options.dtr=true]
 * @param {Boolean} [options.rts=true]
 * @param {module:serialport~errorCallback} callback Called once the port's flags have been set.
 * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
 */

/**
 * Get the control flags (CTS, DSR, DCD) on the open port.
 * @method module:serialport~Binding#get
 * @param {module:serialport~modemBitsCallback=} callback Called once the flags have been retrieved.
 * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
 */

/**
 * Flush (discard) data received but not read and written but not transmitted.
 * @method module:serialport~Binding#flush
 * @param  {module:serialport~errorCallback} callback Called once the flush operation finishes.
 * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
 */

/**
 * Drain waits until all output data has been transmitted to the serial port.
 * @method module:serialport~Binding#drain
 * @param  {module:serialport~errorCallback} callback Called once the drain operation finishes.
 * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
 */

/**
 * Changes options on an open port. Currently only the baudRate is required but any option could be passed to the bindings.
 * @param {object=} options Only `baudRate` is currently supported
 * @param {number=} [options.baudRate] If provided a baudRate that isn't supported by the bindings it should pass an error to the callback
 * @param {module:serialport~errorCallback} [callback] Called once the port's baud rate has been changed.
 * @throws {TypeError} When given invalid arguments a TypeError will be thrown.
 */
