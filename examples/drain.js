'use strict';

const SerialPort = require('serialport');
const port = new SerialPort('/dev/cu.Cubelet-RGB');

port.on('open', () => {
  console.log('port opened');
});

const largeMessage = new Buffer(1024 * 10).fill('!');
port.write(largeMessage, () => {
  console.log('Write callback returned');

  // At this point, data may still be buffered and not sent out over the port yet
  // write function returns asynchronously even on the system level.
  console.log('Calling drain');
  port.drain(() => {
    console.log('Drain callback returned');
    // Now the data has "left the pipe" (tcdrain[1]/FlushFileBuffers[2] finished blocking).
    // [1] http://linux.die.net/man/3/tcdrain
    // [2] http://msdn.microsoft.com/en-us/library/windows/desktop/aa364439(v=vs.85).aportx
  });
});

port.on('data', (data) => {
  console.log('Received: \t', data);
});
