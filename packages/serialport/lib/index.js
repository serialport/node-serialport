const SerialPort = require('@serialport/stream')
const Binding = require('@serialport/bindings-cpp')
const parsers = require('./parsers')

/**
 * @type {AbstractBinding}
 */
SerialPort.Binding = Binding

/**
 * @type {Parsers}
 */
SerialPort.parsers = parsers

module.exports = SerialPort
