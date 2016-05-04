#!/usr/bin/env node
'use strict';

var serialport = require('../');
var version = require('../package.json').version;
var args = require('commander');

args
  .version(version)
  .description('List available serial ports')
  .option('-f, --format <type>', 'Format the output as text, json, or jsonline. default: text', /^(text|json|jsonline)$/i, 'text')
  .parse(process.argv);

var formatters = {
  text: function(err, ports) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    ports.forEach(function(port) {
      console.log(port.comName + '\t' + (port.pnpId || '') + '\t' + (port.manufacturer || ''));
    });
  },
  json: function(err, ports) {
    if (err) {
      console.error(JSON.stringify(err));
      process.exit(1);
    }
    console.log(JSON.stringify(ports));
  },
  jsonline: function(err, ports) {
    if (err) {
      console.error(JSON.stringify(err));
      process.exit(1);
    }
    ports.forEach(function(port) {
      console.log(JSON.stringify(port));
    });
  }
};

serialport.list(formatters[args.format]);

