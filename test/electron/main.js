'use strict';

var app = require('electron').app;

try {
  var serialport = require('../..'); // eslint-disable-line no-unused-vars
} catch (e) {
  console.error('Error loading serialport');
  app.exit(-1);
}

app.quit();
