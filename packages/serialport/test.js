'use strict';

const SerialPort = require('./lib/serialport');
const Binding = require('./lib/bindings/mock');
const parsers = require('./lib/parsers');

SerialPort.Binding = Binding;
SerialPort.parsers = parsers;

module.exports = SerialPort;
