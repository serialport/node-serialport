'use strict';

var SerialPort = require('../../');
var port = process.env.TEST_PORT;

if (!port) {
  console.error('Please pass TEST_PORT environment variable');
  process.exit(1);
}

// var Binding = require('../../lib/bindings-mock');
// Binding.createPort(port);
// SerialPort.Binding = Binding;
debugger;

var writeData = new Buffer(50000).fill(1);

var serialPort = new SerialPort(port, {
  // baudRate: 115200
});

serialPort.once('data', function onceData() {
  console.log('writing', writeData.length, 'bytes of data');
  serialPort.write(writeData);
});

var recieved = 0;
serialPort.on('data', function onData(data) {
  recieved += data.length;
  if (recieved >= writeData.length) {
    serialPort.close(function onClose() {
      console.log('finished reading', recieved, 'bytes');
    });
  }
});
