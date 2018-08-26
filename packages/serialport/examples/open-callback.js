/* eslint-disable node/no-missing-require */

// Constructor callback example
const SerialPort = require('serialport')
const port = new SerialPort('/dev/tty-usbserial1', () => {
  console.log('Port Opened')
})

port.write('main screen turn on', err => {
  if (err) {
    return console.log('Error: ', err.message)
  }
  console.log('message written')
})
