#!/usr/bin/env node
'use strict';

var SerialPort = require('../');
var version = require('../package.json').version;
var args = require('commander');

function makeNumber(input) {
  return Number(input);
}

args
  .version(version)
  .usage('-p <port> [options]')
  .description('A basic terminal interface for communicating over a serial port. Pressing ctrl+c exits.')
  .option('-l --list', 'List available ports then exit')
  // TODO make the port not a flag as it's always required
  .option('-p, --port, --portname <port>', 'Path or Name of serial port')
  .option('-b, --baud <baudrate>', 'Baud rate default: 9600', makeNumber, 9600)
  .option('--databits <databits>', 'Data bits default: 8', makeNumber, 8)
  .option('--parity <parity>', 'Parity default: none', 'none')
  .option('--stopbits <bits>', 'Stop bits default: 1', makeNumber, 1)
  // TODO make this on by default
  .option('--echo --localecho', 'Print characters as you type them.')
  .parse(process.argv);

function listPorts() {
  SerialPort.list(function(err, ports) {
    if (err) {
      console.error('Error listing ports', err);
    } else {
      ports.forEach(function(port) {
        console.log(port.comName + '\t' + (port.pnpId || '') + '\t' + (port.manufacturer || ''));
      });
    }
  });
};

if (args.list) {
  return listPorts();
}

if (!args.port) {
  args.outputHelp();
  args.missingArgument('port');
  process.exit(-1);
}

var openOptions = {
  baudRate: args.baud,
  dataBits: args.databits,
  parity: args.parity,
  stopBits: args.stopbits
};

var port = new SerialPort(args.port, openOptions);

process.stdin.resume();
process.stdin.setRawMode(true);
process.stdin.on('data', function(s) {
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
  port.write(s);
});

port.on('data', function(data) {
  process.stdout.write(data.toString());
});

port.on('error', function(err) {
  console.log('Error', err);
  process.exit(1);
});
