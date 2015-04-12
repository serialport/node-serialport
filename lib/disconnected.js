'use strict';
var debug = require('debug')('serialport');

module.exports = function (err) {
  var self = this;
  var fd = self.fd;
  var factory = require('./factorysingleton').getInstance();

  // send notification of disconnect
  if (self.options.disconnectedCallback) {
    self.options.disconnectedCallback(err);
  } else {
    self.emit('disconnect', err);
  }
  self.paused = true;
  self.closing = true;

  self.emit('close');

  // clean up all other items
  fd = self.fd;

  try {
    factory.SerialPortBinding.close(fd, function (err) {
      if (err) {
        debug('Disconnect completed with error: '+JSON.stringify(err));
      } else {
        debug('Disconnect completed.');
      }
    });
  } catch (e) {
    debug('Disconnect completed with an exception: '+JSON.stringify(e));
  }

  self.removeAllListeners();
  self.closing = false;
  self.fd = 0;

  if (process.platform !== 'win32') {
    self.readable = false;
    self.serialPoller.close();
  }

};
