/* eslint-disable node/no-missing-require */
'use strict';

const SerialPort = require('serialport');

SerialPort.list().then((ports) => {
  console.log(ports);
}, (error) => {
  console.error(error);
});
