const SerialPort = require('@serialport/stream')
const { autoDetect } = require('@serialport/bindings-cpp')
const parsers = require('./parsers')

/**
 * @type {AbstractBinding}
 */
SerialPort.Binding = autoDetect()

/**
 * @type {Parsers}
 */
SerialPort.parsers = parsers

module.exports = SerialPort
