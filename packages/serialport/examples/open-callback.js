/* eslint-disable node/no-extraneous-require */

// Constructor callback example
const { SerialPort } = require('serialport')
const port = new SerialPort({ path: '/dev/tty-usbserial1', baudRate: 9600 }, () => {
  console.log('Port Opened')
})

port.write('main screen turn on', err => {
  if (err) {
    return console.log('Error: ', err.message)
  }
  console.log('message written')
})
