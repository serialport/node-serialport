/* eslint-disable node/no-missing-require */

const SerialPort = require('../')
const port = process.env.TEST_PORT
// number of bytes to send
const size = 512

if (!port) {
  console.error('Please pass TEST_PORT environment variable')
  process.exit(1)
}

const serialPort = new SerialPort(port, err => {
  if (err) {
    throw err
  }
})

serialPort.on('open', () => {
  console.log('serialPort opened')
})

const largeMessage = Buffer.alloc(size, '!')
console.log(`Writting data dength: ${largeMessage.length} B`)
serialPort.write(largeMessage, () => {
  console.log('Write callback returned')
})

console.log('Calling drain')
serialPort.drain(() => {
  console.log('Drain callback returned')
})
