/* eslint-disable node/no-missing-require */
'use strict';

// Load Serialport with mock bindings
// const SerialPort = require('../test'); // from inside the serialport repo
const SerialPort = require('serialport/test'); // when installed as a package
const MockBinding = SerialPort.Binding;

const portPath = 'COM_ANYTHING';

// By default the mock bindings pretend to be an arduino with the `arduinoEcho` program loaded.
// This will echo any byte written to the port and will emit "READY" data after opening.

// Create a port and disable the echo.
MockBinding.createPort(portPath, { echo: false });

const port = new SerialPort(portPath);
port.on('open', () => {
  console.log('Port opened:\t', port.path);
});

// Write data and confirm it was written
const message = Buffer.from('Lets write data!');
port.write(message, () => {
  console.log('Write:\t\t Complete!');
  console.log('Last write:\t', port.binding.lastWrite.toString('utf8'));
});

// log received data
port.on('data', (data) => {
  console.log('Received:\t', data.toString('utf8'));
});

port.on('open', () => {
  // To pretend to receive data (only works on open ports)
  port.binding.emitData(Buffer.from('Hi from my test!'));
});
