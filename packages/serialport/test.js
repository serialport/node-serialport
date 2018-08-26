const SerialPort = require('@serialport/stream')
const Binding = require('@serialport/binding-mock')
const parsers = require('./lib/parsers')

SerialPort.Binding = Binding
SerialPort.parsers = parsers

module.exports = SerialPort
