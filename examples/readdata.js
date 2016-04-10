'use strict';
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var parsers = serialport.parsers;

var port = new SerialPort('/dev/cu.usbmodemfd121', {
  baudrate: 9600,
  parser: parsers.readline('\r\n')
});

port.on('open', function() {
  console.log('Port open');
});

port.on('data', function(data) {
  console.log(data);
});
