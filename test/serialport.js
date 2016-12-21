'use strict';

var sinon = require('sinon');
var chai = require('chai');
chai.use(require('chai-subset'));
var assert = chai.assert;

var SerialPort = require('../lib/serialport');
var mockBinding = require('../lib/bindings-mock');

describe('SerialPort', function() {
  var sandbox;

  beforeEach(function() {
    SerialPort.Binding = mockBinding;
    sandbox = sinon.sandbox.create();

    // Create a port for fun and profit
    mockBinding.reset();
    mockBinding.createPort('/dev/exists', { echo: true, readyData: new Buffer(0) });
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('constructor', function() {
    it('provides auto construction', function(done) {
      var serialPort = SerialPort;
      this.port = serialPort('/dev/exists', done);
    });

    describe('autoOpen', function() {
      it('opens the port automatically', function(done) {
        this.port = new SerialPort('/dev/exists', function(err) {
          assert.isNull(err);
          done();
        });
      });

      it('emits the open event', function(done) {
        var port = new SerialPort('/dev/exists');
        port.on('open', done);
      });

      it("doesn't open if told not to", function(done) {
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        port.on('open', function() {
          throw new Error("this shouldn't be opening");
        });
        process.nextTick(done);
      });
    });

    // needs to be passes the callback to open
    it('passes the error to the callback when an bad port is provided', function(done) {
      this.port = new SerialPort('/bad/port', function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    // is this a test for open?
    it('emits an error when an bad port is provided', function(done) {
      var port = new SerialPort('/bad/port');
      port.once('error', function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    it('throws an error when bindings are missing', function(done) {
      SerialPort.Binding = undefined;
      try {
        this.port = new SerialPort('/dev/exists');
      } catch (err) {
        assert.instanceOf(err, Error);
        done();
      }
    });

    it('throws an error when no port is provided', function(done) {
      try {
        this.port = new SerialPort('');
      } catch (err) {
        assert.instanceOf(err, Error);
        done();
      }
    });

    it('throws an error when given bad options even with a callback', function(done) {
      try {
        this.port = new SerialPort('/dev/exists', { baudRate: 'whatever' }, function() {});
      } catch (err) {
        assert.instanceOf(err, Error);
        done();
      }
    });

    it('errors with a non number baudRate', function(done) {
      try {
        this.port = new SerialPort('/bad/port', { baudRate: 'whatever' });
      } catch (err) {
        assert.instanceOf(err, Error);
        done();
      }
    });

    it('errors with invalid databits', function(done) {
      try {
        this.port = new SerialPort('/dev/exists', { dataBits: 19 });
      } catch (err) {
        assert.instanceOf(err, Error);
        done();
      }
    });

    it('errors with invalid stopbits', function(done) {
      try {
        this.port = new SerialPort('/dev/exists', { stopBits: 19 });
      } catch (err) {
        assert.instanceOf(err, Error);
        done();
      }
    });

    it('errors with invalid parity', function(done) {
      try {
        this.port = new SerialPort('/dev/exists', { parity: 'pumpkins' });
      } catch (err) {
        assert.instanceOf(err, Error);
        done();
      }
    });

    it('errors with invalid flow control', function(done) {
      try {
        this.port = new SerialPort('/dev/exists', { xon: 'pumpkins' });
      } catch (err) {
        assert.instanceOf(err, Error);
        done();
      }
    });

    it('sets valid flow control individually', function(done) {
      var options = {
        xon: true,
        xoff: true,
        xany: true,
        rtscts: true,
        autoOpen: false
      };
      var port = new SerialPort('/dev/exists', options);
      assert.isTrue(port.settings.xon);
      assert.isTrue(port.settings.xoff);
      assert.isTrue(port.settings.xany);
      assert.isTrue(port.settings.rtscts);
      done();
    });

    it('allows optional options', function(done) {
      this.port = new SerialPort('/dev/exists', done);
    });
  });

  describe('property', function() {
    describe('.baudRate', function() {
      it('is a read only property set during construction', function() {
        var port = new SerialPort('/dev/exists', { autoOpen: false, baudRate: 14400 });
        assert.equal(port.baudRate, 14400);
        try {
          port.baudRate = 9600;
        } catch (e) {
          assert.instanceOf(e, TypeError);
        }
        assert.equal(port.baudRate, 14400);
      });
    });

    describe('.path', function() {
      it('is a read only property set during construction', function() {
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        assert.equal(port.path, '/dev/exists');
        try {
          port.path = 'foo';
        } catch (e) {
          assert.instanceOf(e, TypeError);
        }
        assert.equal(port.path, '/dev/exists');
      });
    });

    describe('.isOpen', function() {
      it('is a read only property', function() {
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        assert.equal(port.isOpen, false);
        try {
          port.isOpen = 'foo';
        } catch (e) {
          assert.instanceOf(e, TypeError);
        }
        assert.equal(port.isOpen, false);
      });

      it('returns false when the port is created', function(done) {
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        assert.isFalse(port.isOpen);
        done();
      });

      it('returns false when the port is opening', function(done) {
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        sandbox.stub(port.binding, 'open', function() {
          assert.isTrue(port.opening);
          assert.isFalse(port.isOpen);
          done();
        });
        port.open();
      });

      it('returns true when the port is open', function(done) {
        var port = new SerialPort('/dev/exists', function() {
          assert.isTrue(port.isOpen);
          done();
        });
      });

      it('returns false when the port is closing', function(done) {
        var port;
        port = new SerialPort('/dev/exists', {}, function() {
          sandbox.stub(this.binding, 'close', function() {
            assert.isFalse(port.isOpen);
            done();
          });
          port.close();
        });
      });

      it('returns false when the port is closed', function(done) {
        var port = new SerialPort('/dev/exists', function() {
          port.close();
        });
        port.on('close', function() {
          assert.isFalse(port.isOpen);
          done();
        });
      });
    });
  });

  describe('instance method', function() {
    describe('#open', function() {
      it('passes the port to the bindings', function(done) {
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        var openSpy = sandbox.spy(port.binding, 'open');
        assert.isFalse(port.isOpen);
        port.open(function(err) {
          assert.isNull(err);
          assert.isTrue(port.isOpen);
          assert.isTrue(openSpy.calledWith('/dev/exists'));
          done();
        });
      });

      it('passes default options to the bindings', function(done) {
        var defaultOptions = {
          baudRate: 9600,
          parity: 'none',
          xon: false,
          xoff: false,
          xany: false,
          rtscts: false,
          hupcl: true,
          dataBits: 8,
          stopBits: 1
        };
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        sandbox.stub(port.binding, 'open', function(path, opt, cb) {
          assert.equal(path, '/dev/exists');
          assert.containSubset(opt, defaultOptions);
          assert.isFunction(cb);
          done();
        });
        port.open();
      });

      it('calls back an error when opening an invalid port', function(done) {
        var port = new SerialPort('/dev/unhappy', { autoOpen: false });
        port.open(function(err) {
          assert.instanceOf(err, Error);
          done();
        });
      });

      it('emits data after being reopened', function(done) {
        var data = new Buffer('Howdy!');
        var port = new SerialPort('/dev/exists', function() {
          port.close(function() {
            port.open(function() {
              port.binding.write(data, function() {
              });
            });
          });
        });
        port.once('data', function(res) {
          assert.deepEqual(res, data);
          done();
        });
      });

      it('cannot be opened again after open', function(done) {
        var port = new SerialPort('/dev/exists', function() {
          port.open(function(err) {
            assert.instanceOf(err, Error);
            done();
          });
        });
      });

      it('cannot be opened while opening', function(done) {
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        port.open(function(err) {
          assert.isNull(err);
        });
        port.open(function(err) {
          assert.instanceOf(err, Error);
          assert.strictEqual(err.message, 'Port is opening');
          done();
        });
      });

      it('allows opening after an open error', function(done) {
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        var stub = sandbox.stub(port.binding, 'open', function(path, opt, cb) {
          cb(new Error('Haha no'));
        });
        port.open(function(err) {
          assert.instanceOf(err, Error);
          stub.restore();
          port.open(done);
        });
      });
    });

    describe('#write', function() {
      it('writes to the bindings layer', function(done) {
        var data = new Buffer('Crazy!');
        var port = new SerialPort('/dev/exists');
        port.on('open', function() {
          port.write(data, function() {
            assert.deepEqual(data, port.binding.port.lastWrite);
            done();
          });
        });
      });

      it('converts strings to buffers', function(done) {
        var port = new SerialPort('/dev/exists');
        port.on('open', function() {
          var data = 'Crazy!';
          port.write(data, function() {
            var lastWrite = port.binding.port.lastWrite;
            assert.deepEqual(new Buffer(data), lastWrite);
            done();
          });
        });
      });

      it('converts strings with encodings to buffers', function(done) {
        var port = new SerialPort('/dev/exists');
        port.on('open', function() {
          var data = 'COFFEE';
          port.write(data, 'hex', function() {
            var lastWrite = port.binding.port.lastWrite;
            assert.deepEqual(new Buffer(data, 'hex'), lastWrite);
            done();
          });
        });
      });

      it('converts arrays to buffers', function(done) {
        var port = new SerialPort('/dev/exists');
        port.on('open', function() {
          var data = [0, 32, 44, 88];
          port.write(data, function() {
            var lastWrite = port.binding.port.lastWrite;
            assert.deepEqual(new Buffer(data), lastWrite);
            done();
          });
        });
      });
    });

    describe('#close', function() {
      it('emits a close event', function(done) {
        var port = new SerialPort('/dev/exists', function() {
          port.on('close', function() {
            assert.isFalse(port.isOpen);
            done();
          });
          port.close();
        });
      });

      it('has a close callback', function(done) {
        var port = new SerialPort('/dev/exists', function() {
          port.close(function() {
            assert.isFalse(port.isOpen);
            done();
          });
        });
      });

      it('emits the close event and runs the callback', function(done) {
        var called = 0;
        var doneIfTwice = function() {
          called++;
          if (called === 2) { return done() }
        };
        var port = new SerialPort('/dev/exists', function() {
          port.close(doneIfTwice);
        });
        port.on('close', doneIfTwice);
      });

      it('emits an error event or error callback but not both', function(done) {
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        var called = 0;
        var doneIfTwice = function(err) {
          assert.instanceOf(err, Error);
          called++;
          if (called === 2) { return done() }
        };
        port.on('error', doneIfTwice);
        port.close();
        port.close(doneIfTwice);
      });

      it('fires a close event after being reopened', function(done) {
        var port = new SerialPort('/dev/exists', function() {
          var closeSpy = sandbox.spy();
          port.on('close', closeSpy);
          port.close(function() {
            port.open(function() {
              port.close(function() {
                assert.isTrue(closeSpy.calledTwice);
                done();
              });
            });
          });
        });
      });

      it('errors when the port is not open', function(done) {
        var cb = function() {};
        var port = new SerialPort('/dev/exists', { autoOpen: false }, cb);
        port.close(function(err) {
          assert.instanceOf(err, Error);
          done();
        });
      });
    });

    describe('#update', function() {
      it('errors when the port is not open', function(done) {
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        port.update({}, function(err) {
          assert.instanceOf(err, Error);
          done();
        });
      });

      it('sets the baudRate on the port', function(done) {
        // eslint-disable-next-line no-new
        new SerialPort('/dev/exists', function() {
          assert.equal(this.baudRate, 9600);
          this.update({ baudRate: 14400 }, function(err) {
            assert.equal(this.baudRate, 14400);
            assert.isNull(err);
            done();
          });
        });
      });
    });

    describe('#set', function() {
      it('errors when serialport not open', function(done) {
        var cb = function() {};
        var port = new SerialPort('/dev/exists', { autoOpen: false }, cb);
        port.set({}, function(err) {
          assert.instanceOf(err, Error);
          done();
        });
      });

      it('sets the flags on the ports bindings', function(done) {
        var settings = {
          brk: true,
          cts: true,
          dtr: true,
          dts: true,
          rts: true
        };

        var port = new SerialPort('/dev/exists', function() {
          sandbox.stub(port.binding, 'set', function(options) {
            assert.deepEqual(options, settings);
            done();
          });
          port.set(settings);
        });
      });

      it('sets missing options to default values', function(done) {
        var settings = {
          cts: true,
          dts: true,
          rts: false
        };

        var filledWithMissing = {
          brk: false,
          cts: true,
          dtr: true,
          dts: true,
          rts: false
        };

        var port = new SerialPort('/dev/exists', function() {
          sandbox.stub(port.binding, 'set', function(options) {
            assert.deepEqual(options, filledWithMissing);
            done();
          });
          port.set(settings);
        });
      });

      it('resets all flags if none are provided', function(done) {
        var defaults = {
          brk: false,
          cts: false,
          dtr: true,
          dts: false,
          rts: true
        };

        var port = new SerialPort('/dev/exists', function() {
          sandbox.stub(port.binding, 'set', function(options) {
            assert.deepEqual(options, defaults);
            done();
          });
          port.set();
        });
      });
    });

    describe('#flush', function() {
      it('errors when serialport not open', function(done) {
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        port.flush(function(err) {
          assert.instanceOf(err, Error);
          done();
        });
      });
    });

    describe('#drain', function() {
      it('drain errors when serialport not open', function(done) {
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        port.drain(function(err) {
          assert.instanceOf(err, Error);
          done();
        });
      });
    });

    describe('#get', function() {
      it('errors when serialport not open', function(done) {
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        port.get(function(err) {
          assert.instanceOf(err, Error);
          done();
        });
      });

      it('gets the status from the ports bindings', function(done) {
        var status = {
          cts: true,
          dsr: true,
          dcd: true
        };

        var port = new SerialPort('/dev/exists', function() {
          port.get(function(err, modemStatus) {
            assert.isNull(err);
            assert.deepEqual(modemStatus, status);
            done();
          });
        });

        sandbox.stub(port.binding, 'get', function(cb) {
          process.nextTick(function() {
            cb(null, status);
          });
        });
      });
    });
  });

  describe('reading data', function() {
    it('emits data events by default', function(done) {
      var testData = new Buffer('I am a really short string');
      var port = new SerialPort('/dev/exists', function() {
        port.once('data', function(recvData) {
          assert.deepEqual(recvData, testData);
          done();
        });
        port.binding.write(testData, function() {});
      });
    });
  });

  describe('disconnections', function() {
    it('emits a disconnect event and closes the port', function(done) {
      var port = new SerialPort('/dev/exists', function() {
        assert.isTrue(port.isOpen);
        port.binding.disconnect('/dev/exists');
      });
      var spy = sandbox.spy();
      port.on('disconnect', spy);
      port.on('close', function() {
        assert.isFalse(port.isOpen);
        assert.isTrue(spy.calledOnce);
        done();
      });
    });
  });
});
