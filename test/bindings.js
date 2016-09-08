'use strict';

var assert = require('chai').assert;
var assign = require('object.assign').getPolyfill();

var platform;
switch (process.platform) {
  case 'win32':
    platform = 'win32';
    break;
  case 'darwin':
    platform = 'darwin';
    break;
  default:
    platform = 'linux';
}

var defaultOpenOptions = {
  baudRate: 9600,
  dataBits: 8,
  hupcl: true,
  lock: true,
  parity: 'none',
  rtscts: false,
  stopBits: 1,
  xany: false,
  xoff: false,
  xon: false
};

var defaultSetFlags = {
  brk: false,
  cts: false,
  dtr: true,
  dts: false,
  rts: true
};

var bindingsToTest = [
  'mock',
  platform
];

function disconnect(err) {
  throw (err || new Error('disconnected'));
}

// All bindings are required to work with an "echo" firmware
// The echo firmware should respond with this data when it's
// ready to echo. This allows for remote device bootup.
// the default firmware is called arduinoEcho.ino
var readyData = new Buffer('READY');

// Test our mock binding and the binding for the platform we're running on
bindingsToTest.forEach(function(bindingName) {
  var binding = require('../lib/bindings-' + bindingName);
  var testPort = process.env.TEST_PORT;
  if (bindingName === 'mock') {
    testPort = '/dev/exists';
    binding.createPort(testPort, { echo: true, readyData: readyData });
  }

  // eslint-disable-next-line no-use-before-define
  testBinding(bindingName, binding, testPort);
});

function testBinding(bindingName, Binding, testPort) {
  describe('bindings-'+ bindingName, function() {
    describe('static method', function() {
      describe('.list', function() {
        it('returns an array', function(done) {
          Binding.list(function(err, data) {
            assert.isNull(err);
            assert.isArray(data);
            done();
          });
        });

        it('has objects with undefined when there is no data', function(done) {
          Binding.list(function(err, data) {
            assert.isNull(err);
            assert.isArray(data);
            if (data.length === 0) {
              console.log('no ports to test');
              return done();
            }
            var obj = data[0];
            Object.keys(obj).forEach(function(key) {
              assert.notEqual(obj[key], '', 'empty values should be undefined');
              assert.isNotNull(obj[key], 'empty values should be undefined');
            });
            done();
          });
        });
      });
    });

    describe('constructor', function() {
      it('creates a binding object', function() {
        var binding = new Binding({
          disconnect: disconnect
        });
        assert.instanceOf(binding, Binding);
      });

      it('throws when missing disconnect callback', function(done) {
        try {
          new Binding({});
        } catch(e) {
          assert.instanceOf(e, TypeError);
          done();
        }
      });

      it('throws when not given an options object', function(done) {
        try {
          new Binding();
        } catch(e) {
          assert.instanceOf(e, TypeError);
          done();
        }
      });
    });

    describe('instance property', function() {
      describe('#isOpen', function() {
        if (!testPort) {
          it('Cannot be tested. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        var binding;
        beforeEach(function() {
          binding = new Binding({
            disconnect: disconnect
          });
        });

        it('is true after open and false after close', function(done) {
          assert.equal(binding.isOpen, false);
          binding.open(testPort, defaultOpenOptions, function(err) {
            assert.isNull(err);
            assert.equal(binding.isOpen, true);
            binding.close(function(err) {
              assert.isNull(err);
              assert.equal(binding.isOpen, false);
              done();
            });
          });
        });
      });
    });

    describe('instance method', function() {
      describe('#open', function() {
        var binding;
        beforeEach(function() {
          binding = new Binding({
            disconnect: disconnect
          });
        });

        it('errors when providing a bad port', function(done) {
          binding.open('COMBAD', defaultOpenOptions, function(err) {
            assert.instanceOf(err, Error);
            assert.include(err.message, 'COMBAD');
            assert.equal(binding.isOpen, false);
            done();
          });
        });

        it('throws when not given a path', function(done) {
          try {
            binding.open();
          } catch(e) {
            assert.instanceOf(e, TypeError);
            done();
          }
        });

        it('throws when not given options', function(done) {
          try {
            binding.open('COMBAD');
          } catch(e) {
            assert.instanceOf(e, TypeError);
            done();
          }
        });

        it('throws when not given a callback', function(done) {
          try {
            binding.open('COMBAD', {});
          } catch(e) {
            assert.instanceOf(e, TypeError);
            done();
          }
        });

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        it('cannot open if already open', function(done) {
          var options = assign({}, defaultOpenOptions, {lock: false});
          binding.open(testPort, options, function(err) {
            assert.isNull(err);
            binding.open(testPort, options, function(err) {
              assert.instanceOf(err, Error);
              binding.close(done);
            });
          });
        });

        it('keeps open state', function(done) {
          binding.open(testPort, defaultOpenOptions, function(err) {
            assert.isNull(err);
            assert.equal(binding.isOpen, true);
            binding.close(done);
          });
        });

        if (platform === 'win32') {
          it('doesn\'t supports a custom baudRates of 25000');
        } else {
          it('supports a custom baudRate of 25000', function(done) {
            var customRates = assign({}, defaultOpenOptions, {baudRate: 25000});
            binding.open(testPort, customRates, function(err) {
              assert.isNull(err);
              assert.equal(binding.isOpen, true);
              binding.close(done);
            });
          });
        }

        describe('optional locking', function() {
          // Ensure that if we fail, we still close the port
          afterEach(function(done) {
            binding.close(function() {
              done();
            });
          });

          it('locks the port by default', function(done) {
            var binding2 = new Binding({
              disconnect: disconnect
            });

            binding.open(testPort, defaultOpenOptions, function(err) {
              assert.isNull(err);
              assert.equal(binding.isOpen, true);

              binding2.open(testPort, defaultOpenOptions, function(err) {
                assert.instanceOf(err, Error);
                assert.equal(binding2.isOpen, false);
                binding.close(done);
              });
            });
          });

          if (platform === 'win32') {
            it('Ports currently cannot be unlocked on windows');
          } else {
            it('can unlock the port', function(done) {
              var noLock = assign({}, defaultOpenOptions, {lock: false});
              var binding2 = new Binding({
                disconnect: disconnect
              });

              binding.open(testPort, noLock, function(err) {
                assert.isNull(err);
                assert.equal(binding.isOpen, true);

                binding2.open(testPort, noLock, function(err) {
                  assert.isNull(err);
                  assert.equal(binding2.isOpen, true);

                  binding.close(function(err) {
                    assert.isNull(err);
                    binding2.close(done);
                  });
                });
              });
            });
          }
        });
      });

      describe('#close', function() {
        var binding;
        beforeEach(function() {
          binding = new Binding({
            disconnect: disconnect
          });
        });

        it('errors when already closed', function(done) {
          binding.close(function(err) {
            assert.instanceOf(err, Error);
            done();
          });
        });

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        it('closes an open file descriptor', function(done) {
          binding.open(testPort, defaultOpenOptions, function(err) {
            assert.isNull(err);
            assert.equal(binding.isOpen, true);
            binding.close(function(err) {
              assert.isNull(err);
              done();
            });
          });
        });
      });

      describe('#update', function() {
        it('errors asynchronously when not open', function(done) {
          var binding = new Binding({
            disconnect: disconnect
          });
          var zalgo = false;
          binding.update({baudRate: 9600}, function(err) {
            assert.instanceOf(err, Error);
            done();
            zalgo = true;
          });
          if (zalgo) { done(new Error('Zalgo is here')) }
        });

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        var binding;
        beforeEach(function(done) {
          binding = new Binding({
            disconnect: disconnect
          });
          binding.open(testPort, defaultOpenOptions, done);
        });

        afterEach(function(done) {
          binding.close(done);
        });

        it('throws errors when updating nothing', function(done) {
          try {
            binding.update({}, function() {});
          } catch (err) {
            assert.instanceOf(err, Error);
            done();
          }
        });

        it('errors when not called with options', function(done) {
          try {
            binding.set(function() {});
          } catch(e) {
            assert.instanceOf(e, Error);
            done();
          }
        });

        it('updates baudRate', function(done) {
          binding.update({baudRate: 57600}, done);
        });

        // if (platform === 'win32') {
        //   it("doesn't yet support custom rates");
        //   return;
        // }
        //
        // breaks testing for unknown reasons
        // it('updates baudRate to a custom rate', function(done) {
        //   binding.update({baudRate: 25000}, function(err) {
        //     assert.isNull(err);
        //     binding.update({baudRate: defaultOpenOptions.baudRate}, done);
        //   });
        // });
      });

      describe('#write', function() {
        it('errors asynchronously when not open', function(done) {
          var binding = new Binding({
            disconnect: disconnect
          });
          var zalgo = false;
          binding.write(new Buffer([]), function(err) {
            assert.instanceOf(err, Error);
            done();
            zalgo = true;
          });
          if (zalgo) { done(new Error('Zalgo is here')) }
        });

        it('throws when not given a buffer', function(done) {
          var binding = new Binding({
            disconnect: disconnect
          });
          try {
            binding.write(null, function() {});
          } catch(e) {
            assert.instanceOf(e, TypeError);
            done();
          }
        });

        it('throws when not given a callback', function(done) {
          var binding = new Binding({
            disconnect: disconnect
          });
          try {
            binding.write(new Buffer(1));
          } catch(e) {
            assert.instanceOf(e, TypeError);
            done();
          }
        });

        if (!testPort) {
          it('Cannot be tested as we have no test ports on ' + platform);
          return;
        }

        var binding;
        beforeEach(function(done) {
          binding = new Binding({
            disconnect: disconnect
          });
          binding.open(testPort, defaultOpenOptions, done);
        });

        afterEach(function(done) {
          binding.close(done);
        });

        it('calls the write callback once after a small write', function(done) {
          var data = new Buffer('simple write of 24 bytes');
          binding.write(data, function(err) {
            assert.isNull(err);
            done();
          });
        });

        it('calls the write callback once after a 5k write', function(done) {
          this.timeout(20000);
          var data = new Buffer(1024 * 5);
          binding.write(data, function(err) {
            assert.isNull(err);
            done();
          });
        });
      });

      describe('#drain', function() {
        it('errors asynchronously when not open', function(done) {
          var binding = new Binding({
            disconnect: disconnect
          });
          var zalgo = false;
          binding.drain(function(err) {
            assert.instanceOf(err, Error);
            done();
            zalgo = true;
          });
          if (zalgo) { done(new Error('Zalgo is here')) }
        });

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        var binding;
        beforeEach(function(done) {
          binding = new Binding({
            disconnect: disconnect
          });
          binding.open(testPort, defaultOpenOptions, done);
        });

        afterEach(function(done) {
          binding.close(done);
        });

        it('drains the port', function(done) {
          binding.drain(function(err) {
            assert.isNull(err);
            done();
          });
        });
      });

      describe('#flush', function() {
        it('errors asynchronously when not open', function(done) {
          var binding = new Binding({
            disconnect: disconnect
          });
          var zalgo = false;
          binding.flush(function(err) {
            assert.instanceOf(err, Error);
            done();
            zalgo = true;
          });
          if (zalgo) { done(new Error('Zalgo is here')) }
        });

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        var binding;
        beforeEach(function(done) {
          binding = new Binding({
            disconnect: disconnect
          });
          binding.open(testPort, defaultOpenOptions, done);
        });

        afterEach(function(done) {
          binding.close(done);
        });

        it('flushes the port', function(done) {
          binding.flush(done);
        });
      });

      describe('#set', function() {
        it('errors asynchronously when not open', function(done) {
          var binding = new Binding({
            disconnect: disconnect
          });
          var zalgo = false;
          binding.set(defaultSetFlags, function(err) {
            assert.instanceOf(err, Error);
            done();
            zalgo = true;
          });
          if (zalgo) { done(new Error('Zalgo is here')) }
          // console.log(zalgo);
        });

        it('throws when not called with options', function(done) {
          var binding = new Binding({
            disconnect: disconnect
          });
          try {
            binding.set(function() {});
          } catch(e) {
            assert.instanceOf(e, TypeError);
            done();
          }
        });

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        var binding;
        beforeEach(function(done) {
          binding = new Binding({
            disconnect: disconnect
          });
          binding.open(testPort, defaultOpenOptions, done);
        });

        afterEach(function(done) {
          binding.close(done);
        });

        it('sets flags on the port', function(done) {
          binding.set(defaultSetFlags, done);
        });
      });

      // because of the nature of opening and closing the ports a fair amount of data
      // is left over on the pipe and isn't cleared when flushed on unix
      describe('#read', function() {
        it('errors asynchronously when not open', function(done) {
          var binding = new Binding({
            disconnect: disconnect
          });
          var buffer = new Buffer(5);
          var zalgo = false;
          binding.read(buffer, 0, buffer.length, function(err, bytesRead, data) {
            assert.instanceOf(err, Error);
            assert.isUndefined(bytesRead);
            assert.isUndefined(data);
            done();
            zalgo = true;
          });
          if (zalgo) { done(new Error('Zalgo is here')) }
        });

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        var binding;
        var buffer;
        beforeEach(function(done) {
          buffer = new Buffer(readyData.length);
          binding = new Binding({disconnect: disconnect});
          binding.open(testPort, defaultOpenOptions, done);
        });

        afterEach(function(done) {
          binding.close(done);
        });

        it("doesn't error if the port is open", function(done) {
          binding.read(buffer, 0, buffer.length, done);
        });

        it('throws when called without a callback', function(done) {
          try {
            binding.read(buffer, 0, buffer.length);
          } catch (e) {
            assert.instanceOf(e, Error);
            done();
          }
        });

        it('returns at maximum the requested number of bytes', function(done) {
          binding.read(buffer, 0, 1, function(err, bytesRead, data) {
            assert.isNull(err);
            assert.equal(bytesRead, 1);
            assert.strictEqual(data, buffer);
            done();
          });
        });
      });

      describe('#get', function() {
        it('errors asynchronously when not open', function(done) {
          var binding = new Binding({
            disconnect: disconnect
          });
          var zalgo = false;
          binding.get(function(err, data) {
            assert.instanceOf(err, Error);
            assert.isUndefined(data);
            done();
            zalgo = true;
          });
          if (zalgo) { done(new Error('Zalgo is here')) }
        });

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        var binding;
        beforeEach(function(done) {
          binding = new Binding({disconnect: disconnect});
          binding.open(testPort, defaultOpenOptions, done);
        });

        afterEach(function(done) {
          binding.close(done);
        });

        it('gets modem line status from the port', function(done) {
          binding.get(function(err, status) {
            assert.isNull(err);
            assert.isObject(status);
            assert.isBoolean(status.cts);
            assert.isBoolean(status.dsr);
            assert.isBoolean(status.dcd);
            done();
          });
        });
      });

      describe('#disconnect', function() {
        it('calls the disconnect callback', function(done) {
          var binding = new Binding({
            disconnect: function(err) {
              assert.instanceOf(err, Error);
              done();
            }
          });
          binding.disconnect(new Error('Disconnected'));
        });
      });
    });

    describe('disconnections', function() {
      it('calls disconnect callback only when detected on a read');
      it('calls disconnect callback only when detected on a write');
    });
  });
};
