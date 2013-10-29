// This exports a SerialPortBinding like object that has functions
// that will emulate a happy object. These functions can be spied on
// mocked or otherwise abused for testing.

"use strict";

module.exports = {
  open: function (path, opt, cb) {
    this.path = path;
    cb(null, 'fakeFileDescriptor');
  },
  write: function (fd, buffer, cb) {
    this.lastWrite = buffer;
    cb(null, undefined);
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
    this.start = function () {};
    this.cb = cb;
  },
  path: ''
};