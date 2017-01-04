'use strict';

// eslint-disable-next-line require-path-exists/exists
const app = require('electron').app;

try {
  const serialport = require('../..'); // eslint-disable-line no-unused-vars
} catch (e) {
  console.error('Error loading serialport');
  console.error(e);
  console.error(e.stack);
  app.exit(-1);
}

app.quit();
