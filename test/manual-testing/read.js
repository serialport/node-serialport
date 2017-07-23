/* eslint-disable node/no-missing-require */
'use strict';
const SerialPort = require('../../');
const port = process.env.TEST_PORT_RX;
const { exec } = require('child_process');

const expected = 512;

if (!port) {
  console.error('Please pass TEST_PORT environment variable');
  process.exit(1);
}

const serialPort = new SerialPort(port, (err) => {
  if (err) { throw err }
  exec('node drain.js', (err, stdout) => {
    if (err) {
      // node couldn't execute the command
      process.exit(1);
    }

    console.log(stdout);

    setTimeout(() => {
      serialPort.on('data', (data) => {
        console.log(`Recieved data dength: ${data.length} B`);
        if (data.length === expected) {
          process.exit(0);
        } else {
          process.exit(1);
        }
      });
    }, 100);

    setTimeout(() => {
      console.log('Receive data timeout');
      process.exit(1);
    }, 1000);
  });
});
