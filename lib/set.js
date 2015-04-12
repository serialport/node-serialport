'use strict';
var binary = require('node-pre-gyp');

module.exports = function (options, callback) {
  var self = this;
  var fd = self.fd;
  var factory = require('./factorysingleton').getInstance();

  options = (typeof option !== 'function') && options || {};

  // flush defaults, then update with provided details

  if(!options.hasOwnProperty('rts')){
    options.rts = _options.rts;
  }
  if(!options.hasOwnProperty('dtr')){
    options.dtr = _options.dtr;
  }
  if(!options.hasOwnProperty('cts')){
    options.cts = _options.cts;
  }
  if(!options.hasOwnProperty('dts')){
    options.dts = _options.dts;
  }
  if(!options.hasOwnProperty('brk')){
    options.brk = _options.brk;
  }

  if (!fd) {
    var err = new Error('Serialport not open.');
    if (callback) {
      callback(err);
    } else {
      self.emit('error', err);
    }
    return;
  }

  factory.SerialPortBinding.set(fd, options, function (err, result) {
    if (err) {
      if (callback) {
        callback(err, result);
      } else {
        self.emit('error', err);
      }
    } else {
      callback(err, result);
    }
  });
};
