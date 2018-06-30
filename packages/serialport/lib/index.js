'use strict';
const SerialPort = require('./serialport');
const Binding = require('./bindings/auto-detect');
const parsers = require('./parsers');

/**
 * @type {BaseBinding}
 */
SerialPort.Binding = Binding;

/**
 * @type {Parsers}
 */
SerialPort.parsers = parsers;

module.exports = SerialPort;
