"use strict";
/*global process require exports console */

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

// can accept path, baudrate, databits, stopbits, parity
function SerialPort(path) {
  events.EventEmitter.call(this);

  this.baudrate = 38400;
  this.databits = 8;
  this.stopbits = 1;
  this.parity = 0;
  this.encoding = 'utf-8';
  this.port = path;
  
  if (arguments.length >= 2 && BAUDRATES.indexOf(arguments[1]) >= 0) {
    this.baudrate = arguments[1];
  }
  if (arguments.length >= 3 && DATABITS.indexOf(arguments[2]) >= 0)  {
    this.databits = arguments[2];
  }
  if (arguments.length >= 4 && STOPBITS.indexOf(arguments[3]) >= 0)  {
    this.stopbits = arguments[3];
  }
  if (arguments.length >= 5 && PARITY.indexOf(arguments[4]) >= 0)  {
    this.parity = arguments[4];
  }
  if (arguments.length ==6) { 
    this.encoding = arguments[5];
  }
  
  this.fd = serialport_native.open(this.port, this.baudrate, this.databits, this.stopbits, this.parity);

  this.readWatcher = new IOWatcher();
  this.empty_reads = 0;
  this.readWatcher.callback = (function (file_id, me) {
    return function () {
      var buffer = serialport_native.read(file_id, buffer);
      me.emit('data', buffer);
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
  // console.log(this.fd);
  if (Buffer.isBuffer(b))
    serialport_native.write(this.fd, buffer);
  else
    serialport_native.write(this.fd, new Buffer(b));
}


exports.SerialPort = SerialPort;