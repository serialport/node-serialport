/* eslint-disable node/no-missing-require */

const SerialPort = require('serialport')
const port = new SerialPort('/dev/my-great-device')

port.on('open', () => {
  console.log('port opened')
})

port.on('error', error => {
  console.error('Oh no error!')
  console.error(error)
  process.exit(1)
})

const largeMessage = Buffer.alloc(1024 * 10, '!')
// Write will wait for the port to open
port.write(largeMessage, error => {
  console.log('Write callback returned', error)
  // When this runs data may still be buffered in the os or node serialport and not sent
  // out over the port yet. Serialport will wait until any pending writes have completed and then ask
  // the operating system to wait until all data has been written to the file descriptor.
})

console.log('Calling drain')
// Drain will wait for the port to open and the write to finish
port.drain(error => {
  console.log('Drain callback returned', error)
  // Now the data has "left the pipe" (tcdrain[1]/FlushFileBuffers[2] finished blocking).
  // [1] http://linux.die.net/man/3/tcdrain
  // [2] http://msdn.microsoft.com/en-us/library/windows/desktop/aa364439(v=vs.85).aportx
})
