"use strict";
/*global process require exports console */

// Copyright 2011 Chris Williams <chris@iterativedesigns.com>

var sys        = require('sys');
var Buffer     = require('buffer').Buffer;
var stream     = require('stream');
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


// The default options, can be overwritten in the 'SerialPort' constructor
var _options = {
  baudrate: 38400,
  databits: 8,
  stopbits: 1,
  parity: 0,
  buffersize: 255,
  parser: parsers.raw
};
function SerialPort(path, options) {
  options = options || {};
  options.__proto__ = _options;
  stream.Stream.call(this);

  this.port = path;
  
  this.fd = serialport_native.open(this.port, options.baudrate, options.databits, options.stopbits, options.parity);

  this.readWatcher = new IOWatcher();
  this.empty_reads = 0;
  this.readWatcher.callback = (function (file_id, me) {
    return function () {
      var buffer = new Buffer(options.buffersize);
      var bytes_read = 0, err = null;
      try {
        bytes_read = serialport_native.read(file_id, buffer);
      } catch (e) {
        err = e;
      }
      if (bytes_read <= 0) {
        // assume issue with reading.
        me.emit("error", (err ? err :"Read triggered, but no bytes available. Assuming error with serial port shutting down."));
        me.close();
      }
      options.parser(me, buffer.slice(0, bytes_read));
    }
  })(this.fd, this);
  this.readWatcher.set(this.fd, true, false);
  this.readWatcher.start();

}

sys.inherits(SerialPort, stream.Stream);

SerialPort.prototype.close = function () {
  this.readWatcher.stop();
  
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


SerialPort.prototype.end = function(buf, enc) {
  if (buf) {
    this.write(buf, enc);
  }
  this.close();
}


module.exports.SerialPort = SerialPort;
module.exports.parsers = parsers;
