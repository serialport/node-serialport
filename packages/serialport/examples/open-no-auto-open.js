/* eslint-disable node/no-missing-require */

// When disabling open immediately.
const SerialPort = require('serialport')
const port = new SerialPort('/dev/tty-usbserial1', { autoOpen: false })

// If you write before the port is opened the write will be queued
// Since there is no callback any write errors will be emitted on an error event
port.write('main screen turn on')

// Quit on any error
port.on('error', err => {
  console.log(err.message)
  process.exit(1)
})

port.open(err => {
  if (err) {
    return console.log('Error opening port: ', err.message)
  }
})
