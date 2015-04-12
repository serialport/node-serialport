'use strict';

// Require serialport binding from pre-compiled binaries using
// node-pre-gyp, if something fails or package not available fallback
// to regular build from source.
var binary = require('node-pre-gyp');
var path = require('path');
var PACKAGE_JSON = path.join(__dirname, '../package.json');
var binding_path = binary.find(path.resolve(PACKAGE_JSON));
var SerialPortBinding = require(binding_path);

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var instance;

function SerialPortFactory(_spfOptions) {
  EventEmitter.call(this);

  _spfOptions = _spfOptions || {};

  this.spfOptions = {};

  this.spfOptions.queryPortsByPath = (_spfOptions.queryPortsByPath === true ? true : false);

  this.SerialPortBinding = SerialPortBinding;
  this.SerialPort = require('./serialport');
  this.parsers = require('../parsers');

  if (process.platform === 'win32') {
    this.list = SerialPortBinding.list;
  } else if (process.platform === 'darwin') {
    this.list = SerialPortBinding.list;
  } else {
    this.list = require('./listunix');
  }
}
util.inherits(SerialPortFactory, EventEmitter);

module.exports = {
  getInstance: function(_spfOptions) {
    return instance || (instance = new SerialPortFactory(_spfOptions));
  }
};
