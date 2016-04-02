'use strict';

var assert = require('chai').assert;
var serialPort = require('../serialport');
var SerialPort = serialPort.SerialPort;

describe('SerialPort', function () {
  describe('Initialization', function () {
    it('Throws an error in callback when trying to open an invalid port', function (done) {
      this.port = new SerialPort('/dev/nullbad', function (err) {
        assert.isDefined(err);
        done();
      });
    });
  });
  it('.list', function(done) {
    serialPort.list(done);
  });

  describe('Working with virtual ports', function() {
    var testPort = process.env.TEST_PORT;

    if (!testPort) {
      it('Cannot be tested as we have no test ports');
      return;
    }

    it('can open and close ports', function(done) {
      var port = new SerialPort(testPort);
      port.on('open', function() {
        assert.isTrue(port.isOpen());
        port.close();
      });
      port.on('close', function() {
        assert.isFalse(port.isOpen());
        done();
      });
    });
  });
});
