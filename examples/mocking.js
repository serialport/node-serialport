/* eslint-disable node/no-missing-require */
'use strict';

// Load Serialport with mock bindings
const SerialPort = require('serialport/test');
const MockBinding = SerialPort.Binding;

const portPath = 'COM_ANYTHING';

// By default the mock bindings pretend to be an arduino with the `arduinoEcho` program loaded.
// This will echo any byte written to the port and will emit "READY" data after opening.

// Create a port and disable the echo.
MockBinding.createPort(portPath, { echo: false });

const port = new SerialPort(portPath);
port.on('open', () => {
  console.log('port opened');
});

// Write data and confirm it was written
const largeMessage = Buffer.alloc(1024 * 10, '!');
port.write(largeMessage, () => {
  console.log('Write callback returned');
  console.log('Last write:\t', port.binding.lastWrite);
});

// To pretend to receive data
port.on('data', (data) => {
  console.log('Received:\t', data);
});
port.binding.emitData(Buffer.from('Hi from my test!'));
