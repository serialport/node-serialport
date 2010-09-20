"use strict";
/*global process require exports console */

var sys        = require('sys');
var Buffer     = require('buffer').Buffer;
var events     = require('events');
var fs         = require('fs');
var serialport_native    = require('./serialport_native');


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
    // 
    // this.readStream = fs.createReadStream(path);
    // this.readStream.on('data', function(data) {
    //   me.emit('data', data);
    // });
    // this.readStream.on('close', function() {
    //   me.emit('close');
    // });
    // this.readStream.on('error', function(err) {
    //   me.emit('error', err);
    // });
    // this.readStream.resume()

    this.readWatcher = new process.IOWatcher();
    this.empty_reads = 0;
    this.buf = new Buffer(65535);



    this.readWatcher.callback = function () {
        sys.puts("read callback");
        if (me.fd) {
            data_read = fs.read(me.fd, me.buf, 0, 65535, function (err, bytesRead) {
                sys.puts(bytesRead);
                if (err) { 
                    sys.puts('error');
                    me.emit('error',err);
                } else if (bytesRead > 0) {
                    sys.puts('data: '+ me.buf);
                    me.emit('data', me.buf);
                }
                sys.puts("truncate")
                fs.truncate(me.fd, bytesRead);
            });
        }
    };
    this.readWatcher.set(this.fd, true, false);
    this.readWatcher.start();
    
}

sys.inherits(SerialPort, events.EventEmitter);



SerialPort.prototype.close = function () {
    if (this.active)  {
        this.active = false;
        fs.close(this.fd);
        this.readWatcher.stop();
    }
};


SerialPort.prototype.write = function (buffer, cb) { 
    if (cb) 
        fs.write(this.fd, buffer, cb);
    else
        fs.write(this.fd, buffer);
}


exports.SerialPort = SerialPort;