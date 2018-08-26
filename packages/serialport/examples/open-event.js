/* eslint-disable node/no-missing-require */

// Open event example
const SerialPort = require('serialport')
const port = new SerialPort('/dev/tty-usbserial1')

port.on('open', () => {
  console.log('Port Opened')
})

port.write('main screen turn on', err => {
  if (err) {
    return console.log('Error: ', err.message)
  }
  console.log('message written')
})

port.on('data', data => {
  /* get a buffer of data from the serial port */
  console.log(data.toString())
})
