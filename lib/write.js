'use strict';
var debug = require('debug')('serialport');

module.exports = function (buffer, callback) {
  var self = this;
  var factory = require('./factorysingleton').getInstance();

  if (!this.fd) {
    debug('Write attempted, but serialport not available - FD is not set');
    var err = new Error('Serialport not open.');
    if (callback) {
      callback(err);
    } else {
      // console.log("write-fd");
      self.emit('error', err);
    }
    return;
  }

  if (!Buffer.isBuffer(buffer)) {
    buffer = new Buffer(buffer);
  }
  debug('Write: '+JSON.stringify(buffer));
  factory.SerialPortBinding.write(this.fd, buffer, function (err, results) {
    if (callback) {
      callback(err, results);
    } else {
      if (err) {
        // console.log("write");
        self.emit('error', err);
      }
    }
  });
};
