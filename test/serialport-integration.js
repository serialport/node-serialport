'use strict';

var assert = require('chai').assert;
var serialPort = require('../');
var SerialPort = serialPort.SerialPort;

var platform;
switch (process.platform) {
  case 'win32':
    platform = 'win32';
    break;
  case 'darwin':
    platform = 'darwin';
    break;
  default:
    platform = 'unix';
}

var testPort = process.env.TEST_PORT;

describe('SerialPort Integration', function() {
  describe('Initialization', function() {
    it('Throws an error in callback when trying to open an invalid port', function(done) {
      this.port = new SerialPort('COM99', function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    it('Emits an error in an event when trying to open an invalid port', function(done) {
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
    if (!testPort) {
      it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
      return;
    }

    describe('opening and closing', function() {
      it('can open and close', function(done) {
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

      it('cannot be opened twice in the callback', function(done) {
        var port = new SerialPort(testPort, function() {
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
          assert.isNull(err);
          port.close(function(err) {
            assert.isNull(err);
            port.open(function(err) {
              assert.isNull(err);
              port.close(done);
            });
          });
        });
      });
    });

    describe('update', function() {
      if (platform === 'win32') {
        return it("Isn't supported on windows yet");
      }

      it('allows changing the baud rate of an open port', function(done) {
        var port = new SerialPort(testPort, function() {
          port.update({baudRate: 57600}, function(err) {
            assert.isNull(err);
            port.close(done);
          });
        });
      });
    });
  });
});
