'use strict';

var chai = require('chai');
var serialPort = require('../serialport');
var SerialPort = serialPort.SerialPort;

describe('SerialPort', function () {
  describe('Initialization', function () {
    it('Throws an error in callback when trying to open an invalid port', function (done) {
      this.port = new SerialPort('/dev/nullbad', function (err) {
        chai.assert.isDefined(err);
        done();
      });
    });
  });
  it('.list', function(done) {
    serialPort.list(done);
  });
});
