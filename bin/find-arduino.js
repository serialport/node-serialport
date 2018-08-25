#!/usr/bin/env node


// outputs the path to an Arduino to stdout or an error to stderror

const SerialPort = require('../packages/serialport');
SerialPort.list()
  .then(ports => {
    const port = ports.find(port => /arduino/i.test(port.manufacturer));
    if (!port) {
      console.error('Arduino Not found');
      process.exit(1);
    }
    console.log(port.comName);
  });
