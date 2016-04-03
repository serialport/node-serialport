#!/usr/bin/env node

/*
serialDuplexTest.js

Tests the functionality of the serial port library.
To be used in conjunction with the Arduino sketch called ArduinoEcho.ino
*/
'use strict';

// serial port initialization:
var serialport = require('../serialport');     // include the serialport library
var SerialPort = serialport.SerialPort;         // make a local instance of serial
var portName = process.argv[2];                 // get the port name from the command line
var myPort = new SerialPort(portName);          // open the serial port:
var output = 32;                                // ASCII space; lowest printable character
var byteCount = 0;                              // number of bytes read

function onOpen() {
  console.log('port open');
  console.log('baud rate: ' + myPort.options.baudRate);
  var outString = String.fromCharCode(output);
  console.log('Sent:\t\t' + outString);
  myPort.write(outString);
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
  myPort.write(outString);
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

myPort.on('open', onOpen);      // called when the serial port opens
myPort.on('data', onData);    // called when data comes in
myPort.on('close', onClose);    // called when the serial port closes
myPort.on('error', onError);  // called when there's an error with the serial port
