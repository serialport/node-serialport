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

const defaultOpenOptions = Object.freeze({
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
});

const defaultSetFlags = Object.freeze({
  brk: false,
  cts: false,
  dtr: true,
  dts: false,
  rts: true
});

const bindingsToTest = [
  'mock',
  platform
];

function parseDisabled(envStr) {
  return (envStr || '').split(',').reduce((disabled, feature) => {
    disabled[feature] = true;
    return disabled;
  }, {});
}

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
  let disabledFeatures = parseDisabled(process.env.DISABLE_PORT_FEATURE);

  if (bindingName === 'mock') {
    testPort = '/dev/exists';
    binding.createPort(testPort, { echo: true, readyData });
    disabledFeatures = {};
  }

  // eslint-disable-next-line no-use-before-define
  testBinding(bindingName, binding, testPort, disabledFeatures);
});

function testBinding(bindingName, Binding, testPort, disabledFeatures) {
  function testFeature(feature, description, callback) {
    if (disabledFeatures[feature]) {
      return it(`Feature "${feature}" has been disabled. "${description}"`);
    }
    it(description, callback);
  }

  describe(`bindings/${bindingName}`, () => {
    describe('static method', () => {
      describe('.list', () => {
        it('returns an array', () => {
          return Binding.list().then((ports) => {
            assert.isArray(ports);
          });
        });

        it('has objects with undefined when there is no data', () => {
          return Binding.list().then((data) => {
            assert.isArray(data);
            if (data.length === 0) {
              console.log('no ports to test');
              return;
            }
            const obj = data[0];
            Object.keys(obj).forEach((key) => {
              assert.notEqual(obj[key], '', 'empty values should be undefined');
              assert.isNotNull(obj[key], 'empty values should be undefined');
            });
          });
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

        it('is true after open and false after close', () => {
          assert.equal(binding.isOpen, false);
          return binding.open(testPort, defaultOpenOptions).then(() => {
            assert.equal(binding.isOpen, true);
            return binding.close().then(() => {
              assert.equal(binding.isOpen, false);
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

        it('errors when providing a bad port', () => {
          return binding.open('COMBAD', defaultOpenOptions).catch((err) => {
            assert.instanceOf(err, Error);
            assert.include(err.message, 'COMBAD');
            assert.equal(binding.isOpen, false);
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

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        it('cannot open if already open', () => {
          const options = Object.assign({}, defaultOpenOptions, { lock: false });
          return binding.open(testPort, options).then(() => {
            return binding.open(testPort, options).catch((err) => {
              assert.instanceOf(err, Error);
              return binding.close();
            });
          });
        });

        it('keeps open state', () => {
          return binding.open(testPort, defaultOpenOptions).then(() => {
            assert.equal(binding.isOpen, true);
            return binding.close();
          });
        });

        testFeature('baudrate.25000', 'supports a custom baudRate of 25000', () => {
          const customRates = Object.assign({}, defaultOpenOptions, { baudRate: 25000 });
          return binding.open(testPort, customRates).then(() => {
            assert.equal(binding.isOpen, true);
            return binding.close();
          });
        });

        describe('optional locking', () => {
          it('locks the port by default', () => {
            const binding2 = new Binding({ disconnect });

            return binding.open(testPort, defaultOpenOptions).then(() => {
              assert.equal(binding.isOpen, true);
            }).then(() => {
              return binding2.open(testPort, defaultOpenOptions).catch((err) => {
                assert.instanceOf(err, Error);
                assert.equal(binding2.isOpen, false);
                return binding.close();
              });
            });
          });

          testFeature('open.unlock', 'can unlock the port', () => {
            const noLock = Object.assign({}, defaultOpenOptions, { lock: false });
            const binding2 = new Binding({ disconnect });

            return binding.open(testPort, noLock)
              .then(() => assert.equal(binding.isOpen, true))
              .then(() => binding2.open(testPort, noLock))
              .then(() => assert.equal(binding2.isOpen, true))
              .then(() => Promise.all([
                binding.close(),
                binding2.close()
              ]));
          });
        });
      });

      describe('#close', () => {
        let binding;
        beforeEach(() => {
          binding = new Binding({ disconnect });
        });

        it('errors when already closed', () => {
          return binding.close().catch((err) => {
            assert.instanceOf(err, Error);
          });
        });

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        it('closes an open file descriptor', () => {
          return binding.open(testPort, defaultOpenOptions).then(() => {
            assert.equal(binding.isOpen, true);
            return binding.close();
          });
        });
      });

      describe('#update', () => {
        it('throws when not given an object', (done) => {
          const binding = new Binding({ disconnect });

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
          let noZalgo = false;
          binding.update({ baudRate: 9600 }).catch((err) => {
            assert.instanceOf(err, Error);
            assert(noZalgo);
            done();
          });
          noZalgo = true;
        });

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        let binding;
        beforeEach(() => {
          binding = new Binding({ disconnect });
          return binding.open(testPort, defaultOpenOptions);
        });

        afterEach(() => binding.close());

        it('throws errors when updating nothing', (done) => {
          try {
            binding.update({});
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

        it('updates baudRate', () => {
          return binding.update({ baudRate: 57600 });
        });

        testFeature('baudrate.25000', 'updates baudRate to a custom rate', () => {
          return binding.update({ baudRate: 25000 }).then(() => {
            return binding.update({ baudRate: defaultOpenOptions.baudRate });
          });
        });
      });

      describe('#write', () => {
        it('errors asynchronously when not open', (done) => {
          const binding = new Binding({
            disconnect
          });
          let noZalgo = false;
          binding.write(new Buffer([])).catch((err) => {
            assert.instanceOf(err, Error);
            assert(noZalgo);
            done();
          });
          noZalgo = true;
        });

        it('throws when not given a buffer', (done) => {
          const binding = new Binding({
            disconnect
          });
          try {
            binding.write(null);
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
        beforeEach(() => {
          binding = new Binding({
            disconnect
          });
          return binding.open(testPort, defaultOpenOptions);
        });

        afterEach(() => binding.close());

        it('resolves after a small write', () => {
          const data = new Buffer('simple write of 24 bytes');
          return binding.write(data);
        });

        it('resolves after a large write', function() {
          this.timeout(20000);
          const data = new Buffer(1024 * 5);
          return binding.write(data);
        });
      });

      describe('#drain', () => {
        it('errors asynchronously when not open', (done) => {
          const binding = new Binding({
            disconnect
          });
          let noZalgo = false;
          binding.drain().catch((err) => {
            assert.instanceOf(err, Error);
            assert(noZalgo);
            done();
          });
          noZalgo = true;
        });

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        let binding;
        beforeEach(() => {
          binding = new Binding({
            disconnect
          });
          return binding.open(testPort, defaultOpenOptions);
        });

        afterEach(() => binding.close());

        it('drains the port', () => {
          return binding.drain();
        });
      });

      describe('#flush', () => {
        it('errors asynchronously when not open', (done) => {
          const binding = new Binding({
            disconnect
          });
          let noZalgo = false;
          binding.flush().catch((err) => {
            assert.instanceOf(err, Error);
            assert(noZalgo);
            done();
          });
          noZalgo = true;
        });

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        let binding;
        beforeEach(() => {
          binding = new Binding({
            disconnect
          });
          return binding.open(testPort, defaultOpenOptions);
        });

        afterEach(() => binding.close());

        it('flushes the port', () => {
          return binding.flush();
        });
      });

      describe('#set', () => {
        it('errors asynchronously when not open', (done) => {
          const binding = new Binding({
            disconnect
          });
          let noZalgo = false;
          binding.set(defaultSetFlags).catch((err) => {
            assert.instanceOf(err, Error);
            assert(noZalgo);
            done();
          });
          noZalgo = true;
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
        beforeEach(() => {
          binding = new Binding({
            disconnect
          });
          return binding.open(testPort, defaultOpenOptions);
        });

        afterEach(() => binding.close());

        testFeature('set.set', 'sets flags on the port', () => {
          return binding.set(defaultSetFlags);
        });
      });

      // because of the nature of opening and closing the ports a fair amount of data
      // is left over on the pipe and isn't cleared when flushed on unix
      describe('#read', () => {
        it('errors asynchronously when not open', (done) => {
          const binding = new Binding({ disconnect });
          const buffer = new Buffer(5);
          let noZalgo = false;
          binding.read(buffer, 0, buffer.length).catch((err) => {
            assert.instanceOf(err, Error);
            assert(noZalgo);
            done();
          });
          noZalgo = true;
        });

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        let binding, buffer;
        beforeEach(() => {
          buffer = new Buffer(readyData.length);
          binding = new Binding({ disconnect });
          return binding.open(testPort, defaultOpenOptions);
        });

        afterEach(() => binding.close());

        it("doesn't throw if the port is open", () => {
          return binding.read(buffer, 0, buffer.length);
        });

        it('returns at maximum the requested number of bytes', () => {
          return binding.read(buffer, 0, 1).then((bytesRead) => {
            assert.equal(bytesRead, 1);
          });
        });
      });

      describe('#get', () => {
        it('errors asynchronously when not open', (done) => {
          const binding = new Binding({
            disconnect
          });
          let noZalgo = false;
          binding.get().catch((err) => {
            assert.instanceOf(err, Error);
            assert(noZalgo);
            done();
          });
          noZalgo = true;
        });

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
          return;
        }

        let binding;
        beforeEach(() => {
          binding = new Binding({ disconnect });
          return binding.open(testPort, defaultOpenOptions);
        });

        afterEach(() => binding.close());

        testFeature('get.get', 'gets modem line status from the port', () => {
          return binding.get().then((status) => {
            assert.isObject(status);
            assert.isBoolean(status.cts);
            assert.isBoolean(status.dsr);
            assert.isBoolean(status.dcd);
          });
        });
      });
    });

    describe('disconnections', () => {
      it('calls disconnect callback only when detected on a read');
      it('calls disconnect callback only when detected on a write');
    });
  });
};
