'use strict';

/**
 * @module serialport
 * @copyright Chris Williams <chris@iterativedesigns.com>
 */

var SerialPort = require('./serialport');
var Binding = require('./bindings-auto-detect');
var parsers = require('./parsers');

SerialPort.Binding = Binding;
SerialPort.parsers = parsers;

module.exports = SerialPort;
