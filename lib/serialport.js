'use strict';
var stream = require('stream');
var util = require('util');

var parsers = require('../parsers');

//  VALIDATION ARRAYS
var DATABITS = [5, 6, 7, 8];
var STOPBITS = [1, 1.5, 2];
var PARITY = ['none', 'even', 'mark', 'odd', 'space'];
var FLOWCONTROLS = ['XON', 'XOFF', 'XANY', 'RTSCTS'];


function makeDefaultPlatformOptions(){
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
  var factory = require('./factorysingleton').getInstance();

  var args = Array.prototype.slice.call(arguments);
  callback = args.pop();
  if (typeof (callback) !== 'function') {
    callback = null;
  }

  options = (typeof options !== 'function') && options || {};

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


  options.baudRate = options.baudRate || options.baudrate || _options.baudrate;

  options.dataBits = options.dataBits || options.databits || _options.databits;
  if (DATABITS.indexOf(options.dataBits) === -1) {
    err = new Error('Invalid "databits": ' + options.dataBits);
    callback(err);
    return;
  }

  options.stopBits = options.stopBits || options.stopbits || _options.stopbits;
  if (STOPBITS.indexOf(options.stopBits) === -1) {
    err = new Error('Invalid "stopbits": ' + options.stopbits);
    callback(err);
    return;
  }

  options.parity = options.parity || _options.parity;
  if (PARITY.indexOf(options.parity) === -1) {
    err = new Error('Invalid "parity": ' + options.parity);
    callback(err);
    return;
  }
  if (!path) {
    err = new Error('Invalid port specified: ' + path);
    callback(err);
    return;
  }

  // flush defaults, then update with provided details
  options.rtscts = _options.rtscts;
  options.xon = _options.xon;
  options.xoff = _options.xoff;
  options.xany = _options.xany;

  if (options.flowControl || options.flowcontrol) {
    var fc = options.flowControl || options.flowcontrol;

    if (typeof fc === 'boolean') {
      options.rtscts = true;
    } else {
      var clean = fc.every(function (flowControl) {
        var fcup = flowControl.toUpperCase();
        var idx = FLOWCONTROLS.indexOf(fcup);
        if (idx < 0) {
          var err = new Error('Invalid "flowControl": ' + fcup + '. Valid options: ' + FLOWCONTROLS.join(', '));
          callback(err);
          return false;
        } else {

          // "XON", "XOFF", "XANY", "DTRDTS", "RTSCTS"
          switch (idx) {
            case 0: options.xon = true; break;
            case 1: options.xoff = true; break;
            case 2: options.xany = true;  break;
            case 3: options.rtscts = true; break;
          }
          return true;
        }
      });
      if(!clean){
        return;
      }
    }
  }

  options.bufferSize = options.bufferSize || options.buffersize || _options.buffersize;
  options.parser = options.parser || _options.parser;
  options.platformOptions = options.platformOptions || _options.platformOptions;

  options.dataCallback = options.dataCallback || function (data) {
    options.parser(self, data);
  };

  options.disconnectedCallback = options.disconnectedCallback || function (err) {
    if (self.closing) {
      return;
    }
    if (!err) {
      err = new Error('Disconnected');
    }
    self.emit('disconnect', err);
  };

  if (process.platform !== 'win32') {
    // All other platforms:
    this.fd = null;
    this.paused = true;
    this.bufferSize = options.bufferSize || 64 * 1024;
    this.readable = true;
    this.reading = false;
  }

  this.options = options;
  this.path = path;
  if (openImmediately) {
    process.nextTick(function () {
      self.open(callback);
    });
  }
}

util.inherits(SerialPort, stream.Stream);


SerialPort.prototype.open = require('./open');


SerialPort.prototype.isOpen = function() {
  return (this.fd ? true : false);
};

SerialPort.prototype.write = require('./write');

if (process.platform !== 'win32') {
  SerialPort.prototype._read = require('./read');


  SerialPort.prototype._emitData = function (data) {
    this.options.dataCallback(data);
  };

  SerialPort.prototype.pause = function () {
    var self = this;
    self.paused = true;
  };

  SerialPort.prototype.resume = require('./resume');

} // if !'win32'

SerialPort.prototype.disconnected = require('./disconnected');

SerialPort.prototype.close = require('./close');

SerialPort.prototype.flush = require('./flush');

SerialPort.prototype.set = require('./set');

SerialPort.prototype.drain = require('./drain');

module.exports = SerialPort;
