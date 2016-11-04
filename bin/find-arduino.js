#!/usr/bin/env node
'use strict';

// outputs the path to an arduino or nothing

var serialport = require('../');
serialport.list(function(err, ports) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  ports.forEach(function(port) {
    if (/arduino/i.test(port.manufacturer)) {
      console.log(port.comName);
      process.exit(0);
    }
  });
  process.exit(1);
});
