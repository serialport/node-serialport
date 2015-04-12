'use strict';
var binary = require('node-pre-gyp');

module.exports = function (callback) {
  var self = this;
  var factory = require('./factorysingleton').getInstance();

  this.paused = true;
  this.readable = true;
  this.reading = false;
  factory.SerialPortBinding.open(this.path, this.options, function (err, fd) {
    self.fd = fd;
    if (err) {
      if (callback) {
        callback(err);
      } else {
        self.emit('error', err);
      }
      return;
    }
    if (process.platform !== 'win32') {
      self.paused = false;
      self.serialPoller = new factory.SerialPortBinding.SerialportPoller(self.fd, function (err) {
        if (!err) {
          self._read();
        } else {
          self.disconnected(err);
        }
      });
      self.serialPoller.start();
    }

    self.emit('open');
    if (callback) { callback(); }
  });
};
