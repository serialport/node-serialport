#!/usr/bin/env node
'use strict';

var ports = require('../'),
  optimist = require('optimist'),
  through2 = require('through2');

var localEchoStream = through2(function(chunk, enc, cb) {
  if (chunk[0] === 0x0d) {
    this.push('\n');
  } else {
    this.push(chunk);
  }
  cb();
});

var closeDetectStream = through2(function(chunk, enc, cb) {
  if (chunk[0] === 0x03) {
    port.close();
    process.exit(0);
  }

  this.push(chunk);
  cb();
});

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

process.stdin.setRawMode(true);

var openOptions = {
  comName: args.portname,
  baudRate: args.baud,
  dataBits: args.databits,
  parity: args.parity,
  stopBits: args.stopbits
};
var port = ports.open(openOptions);

port.on('error', function (err) {
  console.log(err);
});

var input = process.stdin
  .pipe(closeDetectStream);

if(args.localecho) {
  input = input.pipe(localEchoStream);
}

input
  .pipe(port)
  .pipe(process.stdout);
