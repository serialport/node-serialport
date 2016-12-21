'use strict';

var SerialPort = require('../../');
var port = process.env.TEST_PORT;

if (!port) {
  console.error('Please pass TEST_PORT environment variable');
  process.exit(1);
}

var counter = 0;

function makePort(err) {
  if (err) { throw err }
  counter++;
  if (counter % 1000 === 0) {
    console.log(`Attempt ${counter}`);
    // debugger;
  }
  if (counter > 10000) {
    process.exit(0);
  }
  var serialPort = new SerialPort(port, function(err) {
    if (err) { throw err }
    serialPort.close(makePort);
  });
}

makePort();
