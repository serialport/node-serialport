"use strict";
/*global process require exports console */

var sys        = require('sys'),
Buffer     = require('buffer').Buffer,
events     = require('events'),
fs         = require('fs'),
serialport_native    = require('./serialport_native');


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
    
    this.fd = serialport_native.open(path, baudrate, databits, stopbits, parity);
    this.active = true;

    this.readWatcher = new process.IOWatcher();
    this.empty_reads = 0;
    this.buf = new Buffer(65535);

    function data_ready(header) {
        header.link_type = me.link_type;
        header.time_ms = (header.tv_sec * 1000) + (header.tv_usec / 1000);
        me.buf.pcap_header = header;
        me.emit('data', me.buf);
    }



    // readWatcher gets a callback when pcap has data to read. multiple packets may be readable.
    this.readWatcher.callback = function pcap_read_callback() {
        var packets_read = binding.dispatch(me.buf, packet_ready);
        if (packets_read < 1) {
            // TODO - figure out what is causing this, and if it is bad.
            me.empty_reads += 1;
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


SerialPort.prototype.write = function (buffer) { 
    fs.write(this.fd);
}


exports.SerialPort = SerialPort;