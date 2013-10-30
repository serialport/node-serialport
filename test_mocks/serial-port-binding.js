// This exports a SerialPortBinding like object that has functions
// that will emulate a happy object. These functions can be spied on
// mocked or otherwise abused for testing.

"use strict";

var serialPortBinding;
module.exports = serialPortBinding = {
  open: function (path, opt, cb) {
    this.path = path;
    this.options = opt;
    this.readable = true;
    cb(null, 'fakeFileDescriptor');
  },
  write: function (fd, buffer, cb) {
    this.lastWrite = buffer;
    cb(null, buffer.length);
  },
  _read: function() {

    var echo = this.lastWrite;

    if (!this.readable || this.paused || this.reading) return;

    this.reading = true;

    this.reading = false;

    if (echo && echo.length > 0) {
      this.lastWrite = null;
      this.options.dataCallback(echo);
    }

    // do not emit events anymore after we declared the stream unreadable
    if (!this.readable) return;

    var self = this;
    setTimeout(function() {
      self._read();
    }, 20);
  },
  close: function (fd, cb) {
    cb(null);
  },
  list: function (cb) {
    var fakeSerialPort = {
      comName: '/dev/really-cool-serialport',
      manufacturer: '',
      serialNumber: '',
      pnpId: '',
      locationId: '',
      vendorId: '',
      productId: ''
    };
    cb([fakeSerialPort]);
  },
  flush: function (fd, cb) {
    cb(null, undefined);
  },
  SerialportPoller: function (fd, cb) {
    serialPortBinding.currentSerialPoller = this;
    this.start = function () { serialPortBinding._read(); };
    this.close = function () { };
    this.cb = cb;
  },
  path: ''
};
