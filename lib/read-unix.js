'use strict';
var fs = require('fs');
var ReadPoller = require('bindings')('serialport.node').ReadPoller;

module.exports = function readUnix(buffer, offset, length, cb) {
  if (typeof cb !== 'function') {
    throw new TypeError("cb in read isn't a function");
  }

  if (!this.isOpen) {
    process.nextTick(function() {
      cb(new Error('Port is not open'));
    });
    return;
  }

  if (this.readPoller) {
    this.readPoller.stop();
    this.readPoller = null;
  }

  fs.read(this.fd, buffer, offset, length, null, function afterReadUnix(err, bytesRead) {
    if (err && err.code === 'EAGAIN') {
      this.readPoller = new ReadPoller(this.fd, function afterReadPoller() {
        this.readPoller = null;
        this.read(buffer, offset, length, cb);
      }.bind(this));
      return;
    }

    var disconnectError = err && (
      err.code === 'EBADF'   || // Bad file number means we got closed
      err.code === 'ENXIO'   || // No such device or address probably usb disconnect
      err.code === 'UNKNOWN' || // ¯\_(ツ)_/¯ does this ever happen?
      err.errno === -1 // generic error
    );

    if (disconnectError) {
      return this.disconnect(err);
    }
    cb(err, bytesRead, buffer);
  }.bind(this));
};
