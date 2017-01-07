'use strict';

const SerialPort = require('../../');
const port = process.env.TEST_PORT;

if (!port) {
  console.error('Please pass TEST_PORT environment variable');
  process.exit(1);
}

// var Binding = require('../../lib/bindings/mock');
// Binding.createPort(port);
// SerialPort.Binding = Binding;
// debugger;

const writeData = new Buffer(50000).fill(1);

const serialPort = new SerialPort(port, {
  // baudRate: 115200
});

serialPort.once('data', () => {
  console.log('writing', writeData.length, 'bytes of data');
  serialPort.write(writeData);
});

let recieved = 0;
serialPort.on('data', (data) => {
  recieved += data.length;
  if (recieved >= writeData.length) {
    serialPort.close(() => {
      console.log('finished reading', recieved, 'bytes');
    });
  }
});
