'use strict';
var binary = require('node-pre-gyp');

module.exports = function (callback) {
  var self = this;
  var fd = self.fd;
  var factory = require('./factorysingleton').getInstance();

  if (!fd) {
    var err = new Error('Serialport not open.');
    if (callback) {
      callback(err);
    } else {
      self.emit('error', err);
    }
    return;
  }

  factory.SerialPortBinding.flush(fd, function (err, result) {
    if (err) {
      if (callback) {
        callback(err, result);
      } else {
        self.emit('error', err);
      }
    } else {
      if (callback) {
        callback(err, result);
      }
    }
  });
};
