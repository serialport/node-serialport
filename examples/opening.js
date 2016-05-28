'use strict';

// Open event example

// var SerialPort = require('serialport');
// var port = new SerialPort('/dev/tty-usbserial1');

// port.on('open', function () {
//   port.write('main screen turn on', function(err) {
//     if (err) {
//       return console.log('Error: ', err.message);
//     }
//     console.log('message written');
//   });
// });

// port.on('data', function(data) { /* do anything */ });

// Constructor callback example

// var SerialPort = require('serialport');
// var port = new SerialPort('/dev/tty-usbserial1', function () {
//   port.write('main screen turn on', function(err) {
//     if (err) {
//       return console.log('Error: ', err.message);
//     }
//     console.log('message written');
//   });
// });

// When disabling open immediately.

// var SerialPort = require('serialport');
// var port = new SerialPort('/dev/tty-usbserial1', { autoOpen: false });

// port.open(function (err) {
//   if (err) {
//     return console.log('Error opening port: ', err.message);
//   }

//   // errors will be emitted on the port since there is no callback to write
//   port.write('main screen turn on');
// });
