'use strict';
const crypto = require('crypto');
const assert = require('chai').assert;
const SerialPort = require('../');

let platform;
switch (process.platform) {
  case 'win32':
  case 'darwin':
  case 'linux':
    platform = process.platform;
    break;
  default:
    throw new Error(`Unknown platform "${process.platform}"`);
}

const readyData = new Buffer('READY');

// test everything on our mock biding and natively
const defaultBinding = SerialPort.Binding;
const mockBinding = require('../lib/bindings-mock');

const mockTestPort = '/dev/exists';
mockBinding.createPort(mockTestPort, { echo: true, readyData });

// eslint-disable-next-line no-use-before-define
integrationTest('mock', mockTestPort, mockBinding);

// eslint-disable-next-line no-use-before-define
integrationTest(platform, process.env.TEST_PORT, defaultBinding);

// Be careful to close the ports when you're done with them
// Ports are by default exclusively locked so a failure fails all tests
function integrationTest(platform, testPort, binding) {
  describe(`${platform} SerialPort Integration Tests`, function() {
    if (!testPort) {
      it(`${platform} tests requires an Arduino loaded with the arduinoEcho program on a serialport set to the TEST_PORT env var`);
      return;
    }

    beforeEach(function() {
      SerialPort.Binding = binding;
    });

    describe('static Method', function() {
      describe('.list', function() {
        it('contains the test port', function(done) {
          function lastPath(name) {
            const parts = name.split('.');
            return parts[parts.length - 1];
          }

          SerialPort.list(function(err, ports) {
            assert.isNull(err);
            let foundPort = false;
            ports.forEach(function(port) {
              if (lastPath(port.comName) === lastPath(testPort)) {
                foundPort = true;
              }
            });
            assert.isTrue(foundPort);
            done();
          });
        });
      });
    });

    describe('constructor', function() {
      it('provides an error in callback when trying to open an invalid port', function(done) {
        this.port = new SerialPort('COMBAD', function(err) {
          assert.instanceOf(err, Error);
          done();
        });
      });

      it('emits an error event when trying to open an invalid port', function(done) {
        const port = new SerialPort('COM99');
        port.on('error', function(err) {
          assert.instanceOf(err, Error);
          done();
        });
      });
    });

    describe('opening and closing', function() {
      it('can open and close', function(done) {
        const port = new SerialPort(testPort);
        port.on('open', function() {
          assert.isTrue(port.isOpen);
          port.close();
        });
        port.on('close', function() {
          assert.isFalse(port.isOpen);
          done();
        });
      });

      it('cannot be opened again after open', function(done) {
        const port = new SerialPort(testPort, function(err) {
          assert.isNull(err);
          port.open(function(err) {
            assert.instanceOf(err, Error);
            port.close(done);
          });
        });
      });

      it('cannot be opened while opening', function(done) {
        const port = new SerialPort(testPort, { autoOpen: false });
        port.open(function(err) {
          assert.isNull(err);
        });
        port.open(function(err) {
          assert.instanceOf(err, Error);
          assert.strictEqual(err.message, 'Port is opening');
        });
        port.on('open', function() {
          port.close(done);
        });
      });

      it('can open and close ports repetitively', function(done) {
        const port = new SerialPort(testPort, { autoOpen: false });
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

    describe('#update', function() {
      if (platform === 'win32') {
        return it("Isn't supported on windows yet");
      }

      it('allows changing the baud rate of an open port', function(done) {
        const port = new SerialPort(testPort, function() {
          port.update({ baudRate: 57600 }, function(err) {
            assert.isNull(err);
            port.close(done);
          });
        });
      });
    });

    describe('#read and #write', function() {
      it('5k test', function(done) {
        this.timeout(20000);
        // 5k of random ascii
        const output = new Buffer(crypto.randomBytes(5120).toString('ascii'));
        const expectedInput = Buffer.concat([readyData, output]);
        const port = new SerialPort(testPort);

        // this will trigger from the "READY" the arduino sends when it's... ready
        port.once('data', function() {
          port.write(output);
        });

        let input = new Buffer(0);
        port.on('data', function(data) {
          input = Buffer.concat([input, data]);
          if (input.length >= expectedInput.length) {
            assert.equal(input.length, expectedInput.length);
            assert.deepEqual(input, expectedInput);
            port.close(done);
          }
        });
      });
    });
  });
}
