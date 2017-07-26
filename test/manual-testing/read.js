/* eslint-disable node/no-missing-require */
'use strict';
const SerialPort = require('../../');
const { exec } = require('child_process');

// Serial receiver device 
const port = process.env.TEST_PORT_RX;
// Expected number of bytes to receive (should make `size` in drain.js)
const expected = 512;

if (!port) {
  console.error('Please pass TEST_PORT environment variable');
  process.exit(1);
}

// Create read device
const serialPort = new SerialPort(port, (err) => {
  if (err) { throw err }

  // Run the drain script from the sender device
  exec('node drain.js', (err, stdout) => {
    if (err) {
      // node couldn't execute the command
      process.exit(1);
    }

    console.log(stdout);

    // Read back the data received on the read device after a short timout to ensure transmission
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

    // Set a timeout so the process exits if no data received
    setTimeout(() => {
      console.log('Receive data timeout');
      process.exit(1);
    }, 10000);
  });
});
