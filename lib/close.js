'use strict';
var binary = require('node-pre-gyp');

module.exports = function (callback) {
  var self = this;
  var fd = self.fd;
  var factory = require('./factorysingleton').getInstance();

  if (self.closing) {
    return;
  }
  if (!fd) {
    var err = new Error('Serialport not open.');
    if (callback) {
      callback(err);
    } else {
      // console.log("sp not open");
      self.emit('error', err);
    }
    return;
  }

  self.closing = true;

  // Stop polling before closing the port.
  if (process.platform !== 'win32') {
    self.readable = false;
    self.serialPoller.close();
  }

  try {
    factory.SerialPortBinding.close(fd, function (err) {

      if (err) {
        if (callback) {
          callback(err);
        } else {
          // console.log("doclose");
          self.emit('error', err);
        }
        return;
      }

      self.emit('close');
      self.removeAllListeners();
      self.closing = false;
      self.fd = 0;

      if (callback) {
        callback();
      }
    });
  } catch (ex) {
    self.closing = false;
    if (callback) {
      callback(ex);
    } else {
      self.emit('error', ex);
    }
  }
};
