#!/usr/bin/env node
'use strict';
const repl = require('repl');
const promirepl = require('promirepl').promirepl;

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
        reject(new Error('No arduinos found. You must specify a port to load.\n\nFor example:\n\tserialport-repl COM3\n\tserialport-repl /dev/tty.my-serialport'));
      }
    });
  });
}

findArduino().then((portName) => {
  console.log(`port = SerialPort("${portName}", { autoOpen: false })`);
  console.log('globals { SerialPort, portName, port }');
  const port = new SerialPort(portName, { autoOpen: false });
  const spRepl = repl.start({ prompt: '> ' });
  promirepl(spRepl);
  spRepl.context.SerialPort = SerialPort;
  spRepl.context.portName = portName;
  spRepl.context.port = port;
}).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
