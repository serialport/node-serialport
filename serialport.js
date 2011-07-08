"use strict";
/*global process require exports console */

// Copyright 2011 Chris Williams <chris@iterativedesigns.com>

var sys        = require('sys');
var Buffer     = require('buffer').Buffer;
var stream     = require('stream');
var fs         = require('fs');
var net        = require('net');
var serialport_native    = require('./serialport_native');
var IOWatcher   = process.binding('io_watcher').IOWatcher;

var BAUDRATES = [115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300, 200, 150, 134, 110, 75, 50];
var DATABITS  = [8, 7, 6, 5];
var STOPBITS  = [1, 2];
var PARITY    = [0, 1, 2];
var FLOWCONTROL = [0, 1];

var parsers = {
  raw: function (emitter, buffer) {
    emitter.emit("data", buffer);
  },
  readline: function (delimiter) {
    if (typeof delimiter === "undefined" || delimiter === null) { delimiter = "\r"; }
    // Delimiter buffer saved in closure
    var data = "";
    return function (emitter, buffer) {
      // Collect data
      data += buffer.toString();
      // Split collected data by delimiter
      var parts = data.split(delimiter)
      data = parts.pop();
      parts.forEach(function (part, i, array) {
        emitter.emit('data', part);
      });
    };
  }
};


// The default options, can be overwritten in the 'SerialPort' constructor
var _options = {
  baudrate: 38400,
  databits: 8,
  stopbits: 1,
  parity: 0,
  flowcontrol: 0,
  buffersize: 255,
  parser: parsers.raw
};
function SerialPort(path, options) {
  options = options || {};
  options.__proto__ = _options;

  if (BAUDRATES.indexOf(options.baudrate) == -1) {
    throw new Error('Invalid "baudrate": ' + options.baudrate);
  }
  if (DATABITS.indexOf(options.databits) == -1) {
    throw new Error('Invalid "databits": ' + options.databits);
  }
  if (STOPBITS.indexOf(options.stopbits) == -1) {
    throw new Error('Invalid "stopbits": ' + options.stopbits);
  }
  if (PARITY.indexOf(options.parity) == -1) {
    throw new Error('Invalid "parity": ' + options.parity);
  }
  if (FLOWCONTROL.indexOf(options.flowcontrol) == -1) {
    throw new Error('Invalid "flowcontrol": ' + options.flowcontrol);
  }

  stream.Stream.call(this);

  this.port = path;
  this.fd = serialport_native.open(this.port, options.baudrate, options.databits, options.stopbits, options.parity, options.flowcontrol);
  if (this.fd == -1) {
    throw new Error("Could not open serial port");
  } else {
    this.readStream = fs.createReadStream(this.port,{bufferSize:options.buffersize});
    var dataCallback = (function (me) {
      return (function (buffer) {
        options.parser(me, buffer)
      });
    })(this);
    var errorCallback = (function (me) {
      return (function (err) {
        me.emit("error", err);
      });
    });
    this.readStream.on("data", dataCallback);
    this.readStream.on("error", errorCallback);
  }
}

sys.inherits(SerialPort, stream.Stream);

SerialPort.prototype.close = function () {
  this.readStream.close();
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
};


SerialPort.prototype.end = function(buf, enc) {
  if (buf) {
    this.write(buf, enc);
  }
  this.close();
}


module.exports.SerialPort = SerialPort;
module.exports.parsers = parsers;
