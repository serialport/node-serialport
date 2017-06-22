#!/usr/bin/env node
'use strict';
process.env.DEBUG = '*';
const SerialPort = require('../');

// outputs the path to an arduino or nothing
function findArduino() {
  return new Promise((resolve, reject) => {
    if (process.argv[2]) {
      return resolve(process.argv[2]);
    }
    SerialPort.list((err, ports) => {
      if (err) { return reject(err) }
      let resolved = false;
      ports.forEach((port) => {
        if (!resolved && /arduino/i.test(port.manufacturer)) {
          resolved = true;
          return resolve(port.comName);
        }
      });
      if (!resolved) {
        reject(new Error('No arduinos found'));
      }
    });
  });
}

findArduino().then((portName) => {
  const port = new SerialPort(portName);
  port.on('open', () => {
    console.log('opened', portName);
    // port.write(Buffer.alloc(1024 * 20, 0));
    port.on('data', data => console.log('data', data.toString())); // put the port into flowing mode
    // setTimeout(() => {
    //   console.log('closing');
    //   port.close((err) => {
    //     console.log('closed?', err);
    //   });
    // }, 5000);
  });
}, () => {
  console.log('no arduino');
});

process.on('unhandledRejection', r => console.log(r, r.stack));
