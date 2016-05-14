'use strict';

var sinon = require('sinon');
var chai = require('chai');
chai.use(require('chai-subset'));
var assert = chai.assert;
var expect = chai.expect;

var MockedSerialPort = require('./mocks/darwin-hardware');
var SerialPort = MockedSerialPort.SerialPort;
var hardware = MockedSerialPort.hardware;
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

  describe('Constructor', function() {
    it('opens the port immediately', function(done) {
      this.port = new SerialPort('/dev/exists', function(err) {
        expect(err).to.not.be.ok;
        done();
      });
    });

    it('emits the open event', function(done) {
      var port = new SerialPort('/dev/exists');
      port.on('open', done);
    });

    it('emits an error on the factory when erroring without a callback', function(done) {
      MockedSerialPort.once('error', function(err) {
        assert.instanceOf(err, Error);
        done();
      });
      this.port = new SerialPort('/bad/port');
    });

    it('emits an error when an invalid port is provided', function(done) {
      var port = new SerialPort('/bad/port');
      port.once('error', function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    it('errors with invalid databits', function(done) {
      this.port = new SerialPort('/dev/exists', { databits: 19 }, false, function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    it('errors with invalid stopbits', function(done) {
      this.port = new SerialPort('/dev/exists', { stopbits: 19 }, function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    it('errors with invalid parity', function(done) {
      this.port = new SerialPort('/dev/exists', { parity: 'pumpkins' }, false, function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    describe('flowControl', function() {
      it('errors with invalid flow control', function(done) {
        var opts = { flowcontrol: ['pumpkins'] };
        this.port = new SerialPort('/dev/exists', opts, false, function(err) {
          assert.instanceOf(err, Error);
          done();
        });
      });

      it('sets valid flow control', function(done) {
        var port = new SerialPort('/dev/exists', { flowcontrol: ['xon', 'XOFF', 'xany', 'RTSCTS'] }, false);
        assert.isTrue(port.options.xon);
        assert.isTrue(port.options.xoff);
        assert.isTrue(port.options.xany);
        assert.isTrue(port.options.rtscts);
        done();
      });

      it('sets rtscts to true if flow control is true', function(done) {
        var port = new SerialPort('/dev/exists', { flowcontrol: true }, false);
        assert.isFalse(port.options.xon);
        assert.isFalse(port.options.xoff);
        assert.isFalse(port.options.xany);
        assert.isTrue(port.options.rtscts);
        done();
      });

      it('sets valid flow control individually', function(done) {
        var options = {
          xon: true,
          xoff: true,
          xany: true,
          rtscts: true
        };
        var port = new SerialPort('/dev/exists', options, false);
        assert.isTrue(port.options.xon);
        assert.isTrue(port.options.xoff);
        assert.isTrue(port.options.xany);
        assert.isTrue(port.options.rtscts);
        done();
      });
    });

    it('allows optional options', function(done) {
      this.port = new SerialPort('/dev/exists', done);
    });
  });

  describe('Functions', function() {
    describe('#open', function() {
      it('passes the port to the bindings', function(done) {
        var openSpy = sandbox.spy(bindings, 'open');
        var port = new SerialPort('/dev/exists', {}, false);
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
        var port = new SerialPort('/dev/exists', {}, false);
        port.open();
      });

      it('calls back an error when opening an invalid port', function(done) {
        var port = new SerialPort('/dev/unhappy', {}, false);
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
        var port = new SerialPort('/dev/exists', {}, false);
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
        var port = new SerialPort('/dev/exists', false);
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
        var port = new SerialPort('/dev/exists', false, cb);
        port.close(function(err) {
          assert.instanceOf(err, Error);
          done();
        });
      });
    });

    describe('#isOpen', function() {
      it('returns false when the port is created', function(done) {
        var port = new SerialPort('/dev/exists', {}, false);
        assert.isFalse(port.isOpen());
        done();
      });

      it('returns false when the port is opening', function(done) {
        var port = new SerialPort('/dev/exists', {}, false);
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
        var port = new SerialPort('/dev/exists', {}, false, cb);
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
      var port = new SerialPort('/dev/exists', {}, false, cb);
      port.flush(function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    it('drain errors when serialport not open', function(done) {
      var cb = function() {};
      var port = new SerialPort('/dev/exists', {}, false, cb);
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

    it('calls the dataCallback if set', function(done) {
      var testData = new Buffer('I am a really short string');
      var opt = {
        dataCallback: function(recvData) {
          expect(recvData).to.eql(testData);
          done();
        }
      };
      this.port = new SerialPort('/dev/exists', opt, function() {
        hardware.emitData('/dev/exists', testData);
      });
    });
  });

  describe('disconnections', function() {
    it('calls the disconnect callback', function(done) {
      this.port = new SerialPort('/dev/exists', {
        disconnectedCallback: done
      }, function() {
        hardware.disconnect('/dev/exists');
      });
    });

    it('emits a disconnect event', function(done) {
      var port = new SerialPort('/dev/exists', function() {
        hardware.disconnect('/dev/exists');
      });
      port.on('disconnect', function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    // Disconnects are inconsistent bananas
    // it('closes the port', function(done) {
    //   var port = new SerialPort('/dev/exists', function () {
    //     expect(port.fd).to.equal(0);
    //     hardware.disconnect('/dev/exists');
    //   });
    //   var spy = sandbox.spy();
    //   port.on('disconnect', spy);
    //   port.on('close', function(err) {
    //     assert.instanceOf(err, Error);
    //     assert.isFalse(port.isOpen());
    //     assert(spy.calledOnce);
    //     done();
    //   });
    // });
  });
});
