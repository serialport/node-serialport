#!/usr/bin/env node
'use strict';

// outputs the path to an arduino or nothing

const serialport = require('../');
serialport.list()
  .then(ports => ports.find(port => /arduino/i.test(port.manufacturer)))
  .then(port => {
    if (!port) { throw new Error('Arduino Not found') }
    console.log(port.comName);
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
