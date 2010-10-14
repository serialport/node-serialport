"use strict";
/*global process require exports console */

var sys        = require('sys');
var Buffer     = require('buffer').Buffer;
var events     = require('events');
var fs         = require('fs');
var serialport_native    = require('./serialport_native');
// var IOWatcher   = process.binding('io_watcher').IOWatcher; // - for the future!

var BAUDRATES = [115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 120,, 600, 300, 200, 150, 134, 110, 75, 50];
var DATABITS  = [8, 7, 6, 5];
var STOPBITS  = [1, 2];
var PARITY    = [0, 1, 2];

// can accept path, baudrate, databits, stopbits, parity
function SerialPort(path) {
    var me = this;
    events.EventEmitter.call(this);
    this.active = false;
    
    this.baudrate = 38400;
    this.databits = 8;
    this.stopbits = 1;
    this.parity = 0;
    
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
    
    this.fd = serialport_native.open(path, this.baudrate, this.databits, this.stopbits, this.parity);
    this.active = true;


    this.readWatcher = new process.IOWatcher();
    this.empty_reads = 0;
    this.readWatcher.callback = function () {
        sys.puts("read")
        me.read();
    };
    this.readWatcher.set(this.fd, true, false);
    this.readWatcher.start();

}

sys.inherits(SerialPort, events.EventEmitter);

SerialPort.prototype.read = function () {
    if (this.fd) {
        sys.puts("callback");
        var buff = new Buffer(65535);
        data_read = serialport_native.read(this.fd, buff);
        sys.p(buff);
        if (data_read > 0)   {
            sys.puts("Read some data: " + data_read + " bytes");
            sys.puts("Here is the data: " + buff.toString('utf8', 0, data_read));
            me.emit('data', buff);
        }
    }
}

SerialPort.prototype.close = function () {
    if (this.active)  {
        this.active = false;
        fs.close(this.fd);
        // Commented out so it doesnt kill the process
        // this.readWatcher.stop();
    }
};


SerialPort.prototype.write = function (buffer) { 
    serialport_native.write(this.fd, buffer);
}


exports.SerialPort = SerialPort;