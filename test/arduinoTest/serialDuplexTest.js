#!/usr/bin/env node

/*
serialDuplexTest.js

Tests the functionality of the serial port library.
To be used in conjunction with the Arduino sketch ArduinoEcho.ino
*/
'use strict';
var SerialPort = require('../../serialport').SerialPort;
var optimist = require('optimist');

var args = optimist
  .alias('h', 'help')
  .alias('h', '?')
  .usage('Run printable characters through the serial port\n Usage: $0')
  .options('p', {
    describe: 'Name of serial port. See serialportlist for available serial ports.'
  })
  .demand(['p'])
  .argv;

if (args.help) {
  optimist.showHelp();
  return process.exit(0);
}

var port = new SerialPort(args.p);          // open the serial port:
var output = 32;                                // ASCII space; lowest printable character
var byteCount = 0;                              // number of bytes read

function onOpen() {
  console.log('Port Open');
  console.log('Baud Rate: ' + port.options.baudRate);
  var outString = String.fromCharCode(output);
  console.log('Sent:\t\t' + outString);
  port.write(outString);
}

function onData(data) {
  if (output <= 126) {        // highest printable character: ASCII ~
    output++;
  } else {
    output = 32;              // lowest printable character: space
  }
  console.log('Received:\t' + data);
  console.log('Read Events:\t' + byteCount);
  byteCount++;
  var outString = String.fromCharCode(output);
  port.write(outString);
  console.log('Sent:\t\t' + outString);
}

function onClose() {
  console.log('port closed');
  process.exit(1);
}

function onError(error) {
  console.log('there was an error with the serial port: ' + error);
  process.exit(1);
}

port.on('open', onOpen);
port.on('data', onData);
port.on('close', onClose);
port.on('error', onError);
