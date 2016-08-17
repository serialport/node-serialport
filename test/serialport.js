'use strict';

var sinon = require('sinon');
var chai = require('chai');
chai.use(require('chai-subset'));
var assert = chai.assert;
var expect = chai.expect;

var SerialPort = require('./mocks/darwin-hardware');
var hardware = SerialPort.hardware;
var bindings = hardware.mockBinding;

describe('SerialPort', function() {
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    // Create a port for fun and profit
    hardware.reset();
    hardware.createPort('/dev/exists');
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('Depreciated options', function() {
    it('legacy constructor still works', function(done){
      this.port = new SerialPort.SerialPort('/dev/exists', done);
    });

    it('throws when `openImmediately` is set', function(done) {
      try {
        this.port = new SerialPort('/dev/exists', {}, false);
      } catch (e) {
        assert.instanceOf(e, TypeError);
        done();
      }
    });
  });

  describe('Constructor', function() {
    it('opens the port immediately', function(done) {
      this.port = new SerialPort('/dev/exists', function(err) {
        assert.isNull(err);
        done();
      });
    });

    it('emits the open event', function(done) {
      var port = new SerialPort('/dev/exists');
      port.on('open', done);
    });

    it('passes the error to the callback when an bad port is provided', function(done) {
      this.port = new SerialPort('/bad/port', function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    it('emits an error when an bad port is provided', function(done) {
      var port = new SerialPort('/bad/port');
      port.once('error', function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    it('throws an error when no port is provided', function(done) {
      try {
        this.port = new SerialPort('');
      } catch(err){
        assert.instanceOf(err, Error);
        done();
      }
    });

    it('throws an error when given bad options even with a callback', function(done) {
      try {
        this.port = new SerialPort('/dev/exists', { baudRate: 'whatever'}, function() {});
      } catch(err){
        assert.instanceOf(err, Error);
        done();
      }
    });

    it('errors with a non number baudRate', function(done) {
      try {
        this.port = new SerialPort('/bad/port', { baudRate: 'whatever'});
      } catch(err){
        assert.instanceOf(err, Error);
        done();
      }
    });

    it('errors with invalid databits', function(done) {
      try {
        this.port = new SerialPort('/dev/exists', { databits: 19 });
      } catch(err){
        assert.instanceOf(err, Error);
        done();
      }
    });

    it('errors with invalid stopbits', function(done) {
      try {
        this.port = new SerialPort('/dev/exists', { stopbits: 19 });
      } catch(err){
        assert.instanceOf(err, Error);
        done();
      }
    });

    it('errors with invalid parity', function(done) {
      try {
        this.port = new SerialPort('/dev/exists', { parity: 'pumpkins' });
      } catch(err){
        assert.instanceOf(err, Error);
        done();
      }
    });

    it('errors with invalid flow control', function(done) {
      try {
        this.port = new SerialPort('/dev/exists', { xon: 'pumpkins' });
      } catch(err){
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
      assert.isTrue(port.options.xon);
      assert.isTrue(port.options.xoff);
      assert.isTrue(port.options.xany);
      assert.isTrue(port.options.rtscts);
      done();
    });

    it('allows optional options', function(done) {
      this.port = new SerialPort('/dev/exists', done);
    });
  });

  describe('Functions', function() {
    describe('#open', function() {
      it('passes the port to the bindings', function(done) {
        var openSpy = sandbox.spy(bindings, 'open');
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        expect(port.isOpen()).to.be.false;
        port.open(function(err) {
          expect(err).to.not.be.ok;
          expect(port.isOpen()).to.be.true;
          expect(openSpy.calledWith('/dev/exists'));
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
          stopBits: 1,
          bufferSize: 65536
        };
        sandbox.stub(bindings, 'open', function(path, opt, cb) {
          assert.equal(path, '/dev/exists');
          assert.containSubset(opt, defaultOptions);
          assert.isFunction(cb);
          done();
        });
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        port.open();
      });

      it('calls back an error when opening an invalid port', function(done) {
        var port = new SerialPort('/dev/unhappy', { autoOpen: false });
        port.open(function(err) {
          expect(err).to.be.ok;
          done();
        });
      });

      it('emits data after being reopened', function(done) {
        var data = new Buffer('Howdy!');
        var port = new SerialPort('/dev/exists', function() {
          port.close(function() {
            port.open(function() {
              port.once('data', function(res) {
                expect(res).to.eql(data);
                done();
              });
              hardware.emitData('/dev/exists', data);
            });
          });
        });
      });

      it('cannot be opened twice in the callback', function(done) {
        var port = new SerialPort('/dev/exists', function() {
          port.open(function(err) {
            assert.instanceOf(err, Error);
            done();
          });
        });
      });

      it('cannot be opened twice', function(done) {
        var port = new SerialPort('/dev/exists', { autoOpen: false });
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
            done();
          }
        };
        port.open(spy);
        port.open(spy);
      });

      it('allows opening after an open error', function(done) {
        var stub = sandbox.stub(bindings, 'open', function(path, opt, cb) {
          cb(new Error('haha no'));
        });
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        port.open(function(err) {
          assert.instanceOf(err, Error);
          stub.restore();
          port.open(done);
        });
      });
    });

    describe('#close', function() {
      it('emits a close event', function(done) {
        var port = new SerialPort('/dev/exists', function() {
          port.on('close', function() {
            assert.isFalse(port.isOpen());
            done();
          });
          port.close();
        });
      });

      it('has a close callback', function(done) {
        var port = new SerialPort('/dev/exists', function() {
          port.close(function() {
            assert.isFalse(port.isOpen());
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
                expect(closeSpy.calledTwice);
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

    describe('#isOpen', function() {
      it('returns false when the port is created', function(done) {
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        assert.isFalse(port.isOpen());
        done();
      });

      it('returns false when the port is opening', function(done) {
        var port = new SerialPort('/dev/exists', { autoOpen: false });
        sandbox.stub(bindings, 'open', function() {
          assert.isTrue(port.opening);
          assert.isFalse(port.isOpen());
          done();
        });
        port.open();
      });

      it('returns true when the port is open', function(done) {
        var port = new SerialPort('/dev/exists', function() {
          assert.isTrue(port.isOpen());
          done();
        });
      });
      it('returns false when the port is closing', function(done) {
        var port;
        sandbox.stub(bindings, 'close', function() {
          assert.isTrue(port.closing);
          assert.isFalse(port.isOpen());
          done();
        });
        port = new SerialPort('/dev/exists', {}, function() {
          port.close();
        });
      });
      it('returns false when the port is closed', function(done) {
        var port = new SerialPort('/dev/exists', function() {
          port.close();
        });
        port.on('close', function() {
          assert.isFalse(port.isOpen());
          done();
        });
      });
    });

    describe('#write', function() {
      it('errors when the port is not open', function(done) {
        var cb = function() {};
        var port = new SerialPort('/dev/exists', false, cb);
        port.write(null, function(err) {
          assert.instanceOf(err, Error);
          done();
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

        sandbox.stub(bindings, 'set', function(fd, options) {
          assert.deepEqual(options, settings);
          done();
        });

        var port = new SerialPort('/dev/exists', function() {
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
        sandbox.stub(bindings, 'set', function(fd, options) {
          assert.deepEqual(options, filledWithMissing);
          done();
        });

        var port = new SerialPort('/dev/exists', function() {
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
        sandbox.stub(bindings, 'set', function(fd, options) {
          assert.deepEqual(options, defaults);
          done();
        });

        var port = new SerialPort('/dev/exists', function() {
          port.set();
        });
      });
    });

    it('flush errors when serialport not open', function(done) {
      var cb = function() {};
      var port = new SerialPort('/dev/exists', { autoOpen: false }, cb);
      port.flush(function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    it('drain errors when serialport not open', function(done) {
      var cb = function() {};
      var port = new SerialPort('/dev/exists', { autoOpen: false }, cb);
      port.drain(function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    it('flush should consider 0 to be a valid fd', function(done) {
      var port = new SerialPort('/dev/exists', function() {
        expect(port.fd).to.equal(0);
        port.flush(done);
      });
    });

    it('drain should consider 0 to be a valid fd', function(done) {
      var port = new SerialPort('/dev/exists', function() {
        expect(port.fd).to.equal(0);
        port.drain(done);
      });
    });

    it('update should consider 0 a valid file descriptor', function() {
      var port = new SerialPort('/dev/exists', function(done) {
        expect(port.fd).to.equal(0);
        port.update({}, done);
      });
    });
  });

  describe('reading data', function() {
    it('emits data events by default', function(done) {
      var testData = new Buffer('I am a really short string');
      var port = new SerialPort('/dev/exists', function() {
        port.once('data', function(recvData) {
          expect(recvData).to.eql(testData);
          done();
        });
        hardware.emitData('/dev/exists', testData);
      });
    });
  });

  describe('disconnections', function() {
    it('emits a disconnect event and closes the port', function(done) {
      var port = new SerialPort('/dev/exists', function() {
        assert.isTrue(port.isOpen());
        hardware.disconnect('/dev/exists');
      });
      var spy = sandbox.spy();
      port.on('disconnect', spy);
      port.on('close', function() {
        assert.isFalse(port.isOpen());
        assert(spy.calledOnce);
        done();
      });
    });
  });
});
