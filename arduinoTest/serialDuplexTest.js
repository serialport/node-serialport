/*
serialDuplexTest.js

Tests the functtionality of the serial port library.
To be used in conjunction with the Arduino sketch called ArduinoEcho.ino
*/
'use strict';

// serial port initialization:
var serialport = require('../serialport'),		// include the serialport library
SerialPort  = serialport.SerialPort,			// make a local instance of serial
portName = process.argv[2];								// get the port name from the command line

var output = 32;													// ASCII space; lowest printable character
var byteCount = 0;												// number of bytes read
// open the serial port:
var myPort = new SerialPort(portName);

function openPort() {
	console.log('port open');
	console.log('baud rate: ' + myPort.options.baudRate);
	var outString = String.fromCharCode(output);
	console.log('String is: ' + outString);
	myPort.write(outString);
}

function receiveData(data) {
	if (output <= 126) {				// highest printable character: ASCII ~
		output++;
	} else {
		output = 32;							// lowest printable character: space
	}
	console.log('received: ' + data);
	console.log('Byte count: ' + byteCount);
	byteCount++;
	var outString = String.fromCharCode(output);
	myPort.write(outString);
	console.log('Sent: ' + outString);
}

function closePort() {
	console.log('port closed');
}

function serialError(error) {
	console.log('there was an error with the serial port: ' + error);
	myPort.close();
}

myPort.on('open', openPort);			// called when the serial port opens
myPort.on('data', receiveData);		// called when data comes in
myPort.on('close', closePort);		// called when the serial port closes
myPort.on('error', serialError);	// called when there's an error with the serial port
