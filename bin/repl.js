#!/usr/bin/env node
'use strict';
process.env.DEBUG = process.env.DEBUG || '*';
const SerialPort = require('../');

// outputs the path to an arduino or nothing
function findArduino() {
  return new Promise((resolve, reject) => {
    const envPort = process.argv[2] || process.env.TEST_PORT;
    if (envPort) {
      return resolve(envPort);
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

const repl = require('repl');
// const { promirepl } = require('promirepl')

findArduino().then((portName) => {
  const port = new SerialPort(portName, { autoOpen: false });
  const spRepl = repl.start({ prompt: '> ' });
  spRepl.context.SerialPort = SerialPort;
  spRepl.context.portName = portName;
  spRepl.context.port = port;
}).catch((e) => {
  console.log(e.message);
  process.exit(1);
});

// promirepl(graphRepl)
