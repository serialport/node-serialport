/* eslint-disable node/no-extraneous-require */

// Use a Readline parser

const { SerialPort, ReadlineParser } = require('serialport')

// Use a `\r\n` as a line terminator
const parser = new ReadlineParser({
  delimiter: '\r\n',
})

const port = new SerialPort({
  path: '/dev/tty-usbserial1',
  baudRate: 57600,
})

port.pipe(parser)

port.on('open', () => console.log('Port open'))

parser.on('data', console.log)

port.write('ROBOT PLEASE RESPOND\n')

// The parser will emit any string response
