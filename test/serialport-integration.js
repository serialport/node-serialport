'use strict';

var assert = require('chai').assert;
var serialPort = require('../');
var SerialPort = serialPort.SerialPort;

describe('SerialPort', function () {
  describe('Initialization', function () {
    it('Throws an error in callback when trying to open an invalid port', function (done) {
      this.port = new SerialPort('COM99', function (err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    it('Emits an error in an event when trying to open an invalid port', function (done) {
      var port = new SerialPort('COM99');
      port.on('error', function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });
  });
  it('.list', function(done) {
    serialPort.list(done);
  });

  // Be careful to close the ports when you're done with them
  // Ports are exclusively locked in windows and maybe other platforms eventually
  describe('with an actual port', function() {
    var testPort = process.env.TEST_PORT;

    if (!testPort) {
      it('Cannot be tested as we have no test ports');
      return;
    }

    it('can open and close', function(done) {
      var port = new SerialPort(testPort);
      port.on('open', function(err) {
        assert.isUndefined(err);
        assert.isTrue(port.isOpen());
        port.close();
      });
      port.on('close', function(err) {
        assert.isUndefined(err);
        assert.isFalse(port.isOpen());
        done();
      });
    });

    it('cannot be opened twice in the callback', function(done) {
      var port = new SerialPort(testPort, function () {
        port.open(function(err) {
          assert.instanceOf(err, Error);
          port.close(done);
        });
      });
    });

    it('cannot be opened twice', function(done) {
      var port = new SerialPort(testPort, {}, false);
      var calls = 0;
      var errors = 0;
      var spy = function(err) {
        calls++;
        if (err) {
          errors++;
          assert.instanceOf(err, Error);
          assert.strictEqual(err.message, 'Port is opening');
        }
        if (calls === 2) {
          assert.strictEqual(errors, 1);
          port.close(done);
        }
      };
      port.open(spy);
      port.open(spy);
    });

    it('can open and close ports repetitively', function(done) {
      var port = new SerialPort(testPort, {}, false);
      port.open(function(err) {
        assert.isUndefined(err);
        port.close(function(err) {
          assert.isUndefined(err);
          port.open(function(err) {
            assert.isUndefined(err);
            port.close(done);
          });
        });
      });
    });
  });
});
