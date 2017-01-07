'use strict';
/* eslint-disable no-new */

const assert = require('chai').assert;

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

const defaultOpenOptions = {
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

const defaultSetFlags = {
  brk: false,
  cts: false,
  dtr: true,
  dts: false,
  rts: true
};

const bindingsToTest = [
  'mock',
  platform
];

function disconnect(err) {
  throw (err || new Error('Unknown disconnection'));
}

// All bindings are required to work with an "echo" firmware
// The echo firmware should respond with this data when it's
// ready to echo. This allows for remote device bootup.
// the default firmware is called arduinoEcho.ino
const readyData = new Buffer('READY');

// Test our mock binding and the binding for the platform we're running on
bindingsToTest.forEach((bindingName) => {
  const binding = require(`../lib/bindings/${bindingName}`);
  let testPort = process.env.TEST_PORT;
  if (bindingName === 'mock') {
    testPort = '/dev/exists';
    binding.createPort(testPort, { echo: true, readyData });
  }

  // eslint-disable-next-line no-use-before-define
  testBinding(bindingName, binding, testPort);
});

function testBinding(bindingName, Binding, testPort) {
  describe(`bindings/${bindingName}`, () => {
    describe('static method', () => {
      describe('.list', () => {
        it('returns an array', (done) => {
          Binding.list((err, data) => {
            assert.isNull(err);
            assert.isArray(data);
            done();
          });
        });

        it('has objects with undefined when there is no data', (done) => {
          Binding.list((err, data) => {
            assert.isNull(err);
            assert.isArray(data);
            if (data.length === 0) {
              console.log('no ports to test');
              return done();
            }
            const obj = data[0];
            Object.keys(obj).forEach((key) => {
              assert.notEqual(obj[key], '', 'empty values should be undefined');
              assert.isNotNull(obj[key], 'empty values should be undefined');
            });
            done();
          });
        });
        it('throws when not given a callback', (done) => {
          try {
            Binding.list();
          } catch (e) {
            assert.instanceOf(e, TypeError);
            done();
          }
        });
      });
    });

    describe('constructor', () => {
      it('creates a binding object', () => {
        const binding = new Binding({
          disconnect
        });
        assert.instanceOf(binding, Binding);
      });

      it('throws when missing disconnect callback', (done) => {
        try {
          new Binding({ });
        } catch (e) {
          assert.instanceOf(e, TypeError);
          done();
        }
      });

      it('throws when not given an options object', (done) => {
        try {
          new Binding();
        } catch (e) {
          assert.instanceOf(e, TypeError);
          done();
        }
      });
    });

    describe('instance property', () => {
      describe('#isOpen', () => {
        if (!testPort) {
          it('Cannot be tested. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        let binding;
        beforeEach(() => {
          binding = new Binding({
            disconnect
          });
        });

        it('is true after open and false after close', (done) => {
          assert.equal(binding.isOpen, false);
          binding.open(testPort, defaultOpenOptions, (err) => {
            assert.isNull(err);
            assert.equal(binding.isOpen, true);
            binding.close((err) => {
              assert.isNull(err);
              assert.equal(binding.isOpen, false);
              done();
            });
          });
        });
      });
    });

    describe('instance method', () => {
      describe('#open', () => {
        let binding;
        beforeEach(() => {
          binding = new Binding({
            disconnect
          });
        });

        it('errors when providing a bad port', (done) => {
          binding.open('COMBAD', defaultOpenOptions, (err) => {
            assert.instanceOf(err, Error);
            assert.include(err.message, 'COMBAD');
            assert.equal(binding.isOpen, false);
            done();
          });
        });

        it('throws when not given a path', (done) => {
          try {
            binding.open('');
          } catch (e) {
            assert.instanceOf(e, TypeError);
            done();
          }
        });

        it('throws when not given options', (done) => {
          try {
            binding.open('COMBAD');
          } catch (e) {
            assert.instanceOf(e, TypeError);
            done();
          }
        });

        it('throws when not given a callback', (done) => {
          try {
            binding.open('COMBAD', {});
          } catch (e) {
            assert.instanceOf(e, TypeError);
            done();
          }
        });

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        it('cannot open if already open', (done) => {
          const options = Object.assign({}, defaultOpenOptions, { lock: false });
          binding.open(testPort, options, (err) => {
            assert.isNull(err);
            binding.open(testPort, options, (err) => {
              assert.instanceOf(err, Error);
              binding.close(done);
            });
          });
        });

        it('keeps open state', (done) => {
          binding.open(testPort, defaultOpenOptions, (err) => {
            assert.isNull(err);
            assert.equal(binding.isOpen, true);
            binding.close(done);
          });
        });

        if (platform === 'win32') {
          it('doesn\'t supports a custom baudRates of 25000');
        } else {
          it('supports a custom baudRate of 25000', (done) => {
            const customRates = Object.assign({}, defaultOpenOptions, { baudRate: 25000 });
            binding.open(testPort, customRates, (err) => {
              assert.isNull(err);
              assert.equal(binding.isOpen, true);
              binding.close(done);
            });
          });
        }

        describe('optional locking', () => {
          // Ensure that if we fail, we still close the port
          afterEach((done) => {
            binding.close(() => {
              done();
            });
          });

          it('locks the port by default', (done) => {
            const binding2 = new Binding({
              disconnect
            });

            binding.open(testPort, defaultOpenOptions, (err) => {
              assert.isNull(err);
              assert.equal(binding.isOpen, true);

              binding2.open(testPort, defaultOpenOptions, (err) => {
                assert.instanceOf(err, Error);
                assert.equal(binding2.isOpen, false);
                binding.close(done);
              });
            });
          });

          if (platform === 'win32') {
            it('Ports currently cannot be unlocked on windows');
          } else {
            it('can unlock the port', (done) => {
              const noLock = Object.assign({}, defaultOpenOptions, { lock: false });
              const binding2 = new Binding({
                disconnect
              });

              binding.open(testPort, noLock, (err) => {
                assert.isNull(err);
                assert.equal(binding.isOpen, true);

                binding2.open(testPort, noLock, (err) => {
                  assert.isNull(err);
                  assert.equal(binding2.isOpen, true);

                  binding.close((err) => {
                    assert.isNull(err);
                    binding2.close(done);
                  });
                });
              });
            });
          }
        });
      });

      describe('#close', () => {
        let binding;
        beforeEach(() => {
          binding = new Binding({
            disconnect
          });
        });

        it('errors when already closed', (done) => {
          binding.close((err) => {
            assert.instanceOf(err, Error);
            done();
          });
        });

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        it('closes an open file descriptor', (done) => {
          binding.open(testPort, defaultOpenOptions, (err) => {
            assert.isNull(err);
            assert.equal(binding.isOpen, true);
            binding.close((err) => {
              assert.isNull(err);
              done();
            });
          });
        });
      });

      describe('#update', () => {
        it('throws when not given an object', (done) => {
          const binding = new Binding({
            disconnect
          });
          try {
            binding.update();
          } catch (e) {
            assert.instanceOf(e, TypeError);
            done();
          }
        });

        it('errors asynchronously when not open', (done) => {
          const binding = new Binding({
            disconnect
          });
          let zalgo = false;
          binding.update({ baudRate: 9600 }, (err) => {
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

        let binding;
        beforeEach((done) => {
          binding = new Binding({
            disconnect
          });
          binding.open(testPort, defaultOpenOptions, done);
        });

        afterEach((done) => {
          binding.close(done);
        });

        it('throws errors when updating nothing', (done) => {
          try {
            binding.update({}, () => {});
          } catch (err) {
            assert.instanceOf(err, Error);
            done();
          }
        });

        it('errors when not called with options', (done) => {
          try {
            binding.set(() => {});
          } catch (e) {
            assert.instanceOf(e, Error);
            done();
          }
        });

        it('updates baudRate', (done) => {
          binding.update({ baudRate: 57600 }, done);
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

      describe('#write', () => {
        it('errors asynchronously when not open', (done) => {
          const binding = new Binding({
            disconnect
          });
          let zalgo = false;
          binding.write(new Buffer([]), (err) => {
            assert.instanceOf(err, Error);
            done();
            zalgo = true;
          });
          if (zalgo) { done(new Error('Zalgo is here')) }
        });

        it('throws when not given a buffer', (done) => {
          const binding = new Binding({
            disconnect
          });
          try {
            binding.write(null, () => {});
          } catch (e) {
            assert.instanceOf(e, TypeError);
            done();
          }
        });

        it('throws when not given a callback', (done) => {
          const binding = new Binding({
            disconnect
          });
          try {
            binding.write(new Buffer(1));
          } catch (e) {
            assert.instanceOf(e, TypeError);
            done();
          }
        });

        if (!testPort) {
          it(`Cannot be tested as we have no test ports on ${platform}`);
          return;
        }

        let binding;
        beforeEach((done) => {
          binding = new Binding({
            disconnect
          });
          binding.open(testPort, defaultOpenOptions, done);
        });

        afterEach((done) => {
          binding.close(done);
        });

        it('calls the write callback once after a small write', (done) => {
          const data = new Buffer('simple write of 24 bytes');
          binding.write(data, (err) => {
            assert.isNull(err);
            done();
          });
        });

        it('calls the write callback once after a 5k write', function(done) {
          this.timeout(20000);
          const data = new Buffer(1024 * 5);
          binding.write(data, (err) => {
            assert.isNull(err);
            done();
          });
        });
      });

      describe('#drain', () => {
        it('errors asynchronously when not open', (done) => {
          const binding = new Binding({
            disconnect
          });
          let zalgo = false;
          binding.drain((err) => {
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

        let binding;
        beforeEach((done) => {
          binding = new Binding({
            disconnect
          });
          binding.open(testPort, defaultOpenOptions, done);
        });

        afterEach((done) => {
          binding.close(done);
        });

        it('drains the port', (done) => {
          binding.drain((err) => {
            assert.isNull(err);
            done();
          });
        });
      });

      describe('#flush', () => {
        it('errors asynchronously when not open', (done) => {
          const binding = new Binding({
            disconnect
          });
          let zalgo = false;
          binding.flush((err) => {
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

        let binding;
        beforeEach((done) => {
          binding = new Binding({
            disconnect
          });
          binding.open(testPort, defaultOpenOptions, done);
        });

        afterEach((done) => {
          binding.close(done);
        });

        it('flushes the port', (done) => {
          binding.flush(done);
        });
      });

      describe('#set', () => {
        it('errors asynchronously when not open', (done) => {
          const binding = new Binding({
            disconnect
          });
          let zalgo = false;
          binding.set(defaultSetFlags, (err) => {
            assert.instanceOf(err, Error);
            done();
            zalgo = true;
          });
          if (zalgo) { done(new Error('Zalgo is here')) }
          // console.log(zalgo);
        });

        it('throws when not called with options', (done) => {
          const binding = new Binding({
            disconnect
          });
          try {
            binding.set(() => {});
          } catch (e) {
            assert.instanceOf(e, TypeError);
            done();
          }
        });

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        let binding;
        beforeEach((done) => {
          binding = new Binding({
            disconnect
          });
          binding.open(testPort, defaultOpenOptions, done);
        });

        afterEach((done) => {
          binding.close(done);
        });

        it('sets flags on the port', (done) => {
          binding.set(defaultSetFlags, done);
        });
      });

      // because of the nature of opening and closing the ports a fair amount of data
      // is left over on the pipe and isn't cleared when flushed on unix
      describe('#read', () => {
        it('errors asynchronously when not open', (done) => {
          const binding = new Binding({ disconnect });
          const buffer = new Buffer(5);
          let zalgo = false;
          binding.read(buffer, 0, buffer.length, (err, bytesRead, data) => {
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

        let binding;
        let buffer;
        beforeEach((done) => {
          buffer = new Buffer(readyData.length);
          binding = new Binding({ disconnect });
          binding.open(testPort, defaultOpenOptions, done);
        });

        afterEach((done) => {
          binding.close(done);
        });

        it("doesn't error if the port is open", (done) => {
          binding.read(buffer, 0, buffer.length, done);
        });

        it('throws when called without a callback', (done) => {
          try {
            binding.read(buffer, 0, buffer.length);
          } catch (e) {
            assert.instanceOf(e, Error);
            done();
          }
        });

        it('returns at maximum the requested number of bytes', (done) => {
          binding.read(buffer, 0, 1, (err, bytesRead, data) => {
            assert.isNull(err);
            assert.equal(bytesRead, 1);
            assert.strictEqual(data, buffer);
            done();
          });
        });
      });

      describe('#get', () => {
        it('errors asynchronously when not open', (done) => {
          const binding = new Binding({
            disconnect
          });
          let zalgo = false;
          binding.get((err, data) => {
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

        let binding;
        beforeEach((done) => {
          binding = new Binding({ disconnect });
          binding.open(testPort, defaultOpenOptions, done);
        });

        afterEach((done) => {
          binding.close(done);
        });

        it('gets modem line status from the port', (done) => {
          binding.get((err, status) => {
            assert.isNull(err);
            assert.isObject(status);
            assert.isBoolean(status.cts);
            assert.isBoolean(status.dsr);
            assert.isBoolean(status.dcd);
            done();
          });
        });
      });

      describe('#disconnect', () => {
        it('calls the disconnect callback', (done) => {
          const binding = new Binding({
            disconnect(err) {
              assert.instanceOf(err, Error);
              done();
            }
          });
          binding.disconnect(new Error('Disconnected'));
        });
      });
    });

    describe('disconnections', () => {
      it('calls disconnect callback only when detected on a read');
      it('calls disconnect callback only when detected on a write');
    });
  });
};
