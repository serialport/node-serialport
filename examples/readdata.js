'use strict';
const serialport = require('serialport');
const SerialPort = serialport.SerialPort;
const parsers = serialport.parsers;

const port = new SerialPort('/dev/cu.usbmodemfd121', {
  baudrate: 9600,
  parser: parsers.readline('\r\n')
});

port.on('open', function() {
  console.log('Port open');
});

port.on('data', function(data) {
  console.log(data);
});
