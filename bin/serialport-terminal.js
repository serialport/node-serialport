#!/usr/bin/env node

'use strict';

var SerialPort = require('../').SerialPort;
var optimist = require('optimist');

var args = optimist
  .alias('h', 'help')
  .alias('h', '?')
  .options('portname', {
    alias: 'p',
    describe: 'Name of serial port. See serialPortList.js for open serial ports.'
  })
  .options('baud', {
    describe: 'Baud rate.',
    default: 9600
  })
  .options('databits', {
    describe: 'Data bits.',
    default: 8
  })
  .options('parity', {
    describe: 'Parity.',
    default: 'none'
  })
  .options('stopbits', {
    describe: 'Stop bits.',
    default: 1
  })
  .options('localecho', {
    describe: 'Enable local echo.',
    boolean: true
  })
  .argv;

if (args.help) {
  optimist.showHelp();
  return process.exit(-1);
}

if (!args.portname) {
  console.error('Serial port name is required.');
  return process.exit(-1);
}

var openOptions = {
  baudRate: args.baud,
  dataBits: args.databits,
  parity: args.parity,
  stopBits: args.stopbits
};

var port = new SerialPort(args.portname, openOptions);

process.stdin.resume();
process.stdin.setRawMode(true);
process.stdin.on('data', function (s) {
  if (s[0] === 0x03) {
    port.close();
    process.exit(0);
  }
  if (args.localecho) {
    if (s[0] === 0x0d) {
      process.stdout.write('\n');
    } else {
      process.stdout.write(s);
    }
  }
  port.write(s, function (err) {
    if (err) {
      console.log(err);
    }
  });
});

port.on('data', function (data) {
  process.stdout.write(data.toString());
});

port.on('error', function (err) {
  console.log(err);
});
