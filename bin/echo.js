#!/usr/bin/env node
'use strict';

const args = require('commander');
const Buffer = require('safe-buffer').Buffer;
const SerialPort = require('../');
const version = require('../package.json').version;

const readyData = Buffer.from('READY');

args
  .version(version)
  .usage('-p <port>')
  .description('A basic terminal interface for communicating over a serial port. Pressing ctrl+c exits.')
  .option('-p, --port <port>', 'Path or Name of serial port')
  .parse(process.argv);

if (!args.port) {
  args.outputHelp();
  args.missingArgument('port');
  process.exit(-1);
}

const port = new SerialPort(args.port);

port.on('open', () => {
  console.log(`echo: Port open: ${args.port}`);
  setTimeout(() => {
    console.log('echo: READY!');
    port.on('data', data => port.write(data));
    port.write(readyData);
  }, 250);
});
