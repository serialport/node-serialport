/* eslint-disable node/no-missing-require */
'use strict';
const Buffer = require('safe-buffer').Buffer;
const SerialPort = require('../../');
const port = process.env.TEST_PORT;
// number of bytes to send
const size = 512;

if (!port) {
  console.error('Please pass TEST_PORT environment variable');
  process.exit(1);
}

const serialPort = new SerialPort(port, (err) => {
  if (err) { throw err };
});

serialPort.on('open', () => {
  console.log('serialPort opened');
});

const largeMessage = Buffer.alloc(size, '!');
console.log(`Writting data dength: ${largeMessage.length} B`);
serialPort.write(largeMessage, () => {
  console.log('Write callback returned');
});

// At this point, data may still be buffered in the os or node serialserialPort and not sent
// out over the serialPort yet. SerialserialPort will wait until any pending writes have completed and then ask
// the operating system to wait until all data has been written to the file descriptor.
console.log('Calling drain');
serialPort.drain(() => {
  console.log('Drain callback returned');
  // Now the data has "left the pipe" (tcdrain[1]/FlushFileBuffers[2] finished blocking).
  // [1] http://linux.die.net/man/3/tcdrain
  // [2] http://msdn.microsoft.com/en-us/library/windows/desktop/aa364439(v=vs.85).aserialPortx
});
