/* eslint-disable node/no-missing-require */

/**
 * This is a small example app to turn off and on
 * the built-in LED of an arduino by data sent
 * from the browser with socket.io.
 */

'use strict';

// Initialize application constants
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

const serialport = require('serialport');
const SerialPort = serialport.SerialPort;

const serial = new SerialPort('/dev/cu.usbmodem1411', {
  baudRate: 9600,
  parser: SerialPort.parsers.byteLength(1)
});

// Values to send over to Arduino.
const HIGH = Buffer.from([1]);
const LOW = Buffer.from([0]);

/* ===========================================
*
* Setup a simple server.
*
=========================================== */

app.get('/', (req, res) => {
  res.sendfile('index.html');
});

http.listen(port, () => {
  console.log(`listening on *:${port}`);
});

/* ===========================================
*
*  Socket.io stuff
*
=========================================== */

io.on('connection', (socket) => {
  console.log('a user connected');

  /**
   * Socket listener to determine whether or not to send HIGH / LOW
   * values to Arduino.
   */
  socket.on('message', (msg) => {
    console.log('Message received: ', msg);
    switch (msg) {
      case 'on':
        serial.write(HIGH);
        break;
      case 'off':
        serial.write(LOW);
        break;
      default:
        break;
    }
  });
});

/* ===========================================
*
* Serialport stuff
*
=========================================== */

serial.on('open', () => {
  console.log('Port is open!');
});

/**
 * EventListener to receive data from .ino script uploaded to Arduino.
 *
 */
serial.on('data', (data) => {
  let message;

  if (HIGH.compare(data) === 0) {
    message = 'LED successfully turned on.';
  } else if (LOW.compare(data) === 0) {
    message = 'LED successfully turned off.';
  } else {
    message = 'LED did not behave as expected.';
  }

  io.sockets.emit('new message', message);
});

serial.on('close', () => {
  console.log('Serial port disconnected.');
  io.sockets.emit('close');
});
