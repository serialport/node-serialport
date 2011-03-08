"use strict";
/*global process require exports console */

// Copyright 2011 Chris Williams <chris@iterativedesigns.com>

var sys        = require('sys');
var Buffer     = require('buffer').Buffer;
var events     = require('events');
var fs         = require('fs');
var net        = require('net');
var serialport_native    = require('./serialport_native');
var IOWatcher   = process.binding('io_watcher').IOWatcher; // - for the future!

var BAUDRATES = [115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 120,, 600, 300, 200, 150, 134, 110, 75, 50];
var DATABITS  = [8, 7, 6, 5];
var STOPBITS  = [1, 2];
var PARITY    = [0, 1, 2];


var parsers = {
  raw: function (emitter, buffer) {
    emitter.emit("data", buffer);
  },
  readline: function (delimiter) {
    if (!delimiter) { delimiter == "\r" }
    return function (emitter, buffer) {
      var lines = buffer.toString().split(delimiter);
      lines.forEach(function (i) {
        emitter.emit('data', i);
      })
    }
  }
}


// can accept path, baudrate, databits, stopbits, parity
function SerialPort(path, options) {
  var _options = {
    baudrate: 38400,
    databits: 8,
    stopbits: 1,
    parity: 0,
    buffersize: 255,
    parser: parsers.raw
  };
  
  events.EventEmitter.call(this);

  this.port = path;
  
  if (options.baudrate && BAUDRATES.indexOf(options.baudrate) >= 0) {
    _options.baudrate = options.baudrate;
  }
  if (options.databits && DATABITS.indexOf(options.databits) >= 0)  {
    _options.databits = options.databits;
  }
  if (options.stopbits && STOPBITS.indexOf(options.stopbits) >= 0)  {
    _options.stopbits = options.stopbits;
  }
  if (options.parity && PARITY.indexOf(options.parity) >= 0)  {
    _options.parity = options.parity;
  }
  if (options.buffersize && typeof options.buffersize == "number" || options.buffersize instanceof Number) {
    _options.buffersize = options.buffersize;
  }
  if (options.parser && typeof options.parser == 'function') {
    _options.parser = options.parser;
  }
  
  this.fd = serialport_native.open(this.port, _options.baudrate, _options.databits, _options.stopbits, _options.parity);

  this.readWatcher = new IOWatcher();
  this.empty_reads = 0;
  this.readWatcher.callback = (function (file_id, me) {
    return function () {
      var buffer = new Buffer(_options.buffersize);
      var bytes_read = serialport_native.read(file_id, buffer);
      if (bytes_read <= 0) {
        // assume issue with reading.
        me.emit("error", "Read triggered, but no bytes available. Assuming error with serial port shutting down.");
        me.readWatcher.stop();
      }
      _options.parser(me, buffer.slice(0, bytes_read));
    }
  })(this.fd, this);
  this.readWatcher.set(this.fd, true, false);
  this.readWatcher.start();

}

sys.inherits(SerialPort, events.EventEmitter);

SerialPort.prototype.close = function () {
  if (this.fd)  {
    serialport_native.close(this.fd);
    this.fd = null;
  }
};


SerialPort.prototype.write = function (b) { 
  if (Buffer.isBuffer(b))
    serialport_native.write(this.fd, b);
  else
    serialport_native.write(this.fd, new Buffer(b));
}


module.exports.SerialPort = SerialPort;
module.exports.parsers = parsers;