/* eslint-disable node/no-missing-require */
'use strict';
const Buffer = require('safe-buffer').Buffer;
const SerialPort = require('serialport');
const port = new SerialPort('/dev/my-great-device');

port.on('open', () => {
  console.log('port opened');
});

const largeMessage = Buffer.alloc(1024 * 10, '!');
port.write(largeMessage, () => {
  console.log('Write callback returned');
});

// At this point, data may still be buffered in the os or node serialport and not sent
// out over the port yet. Serialport will wait until any pending writes have completed and then ask
// the operating system to wait until all data has been written to the file descriptor.
console.log('Calling drain');
port.drain(() => {
  console.log('Drain callback returned');
  // Now the data has "left the pipe" (tcdrain[1]/FlushFileBuffers[2] finished blocking).
  // [1] http://linux.die.net/man/3/tcdrain
  // [2] http://msdn.microsoft.com/en-us/library/windows/desktop/aa364439(v=vs.85).aportx
});
