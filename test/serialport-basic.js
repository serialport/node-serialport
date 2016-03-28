'use strict';

var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

var MockedSerialPort = require('../test_mocks/darwin-hardware');
var SerialPort = MockedSerialPort.SerialPort;
var hardware = MockedSerialPort.hardware;

describe('SerialPort', function () {
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    // Create a port for fun and profit
    hardware.reset();
    hardware.createPort('/dev/exists');
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('Constructor', function () {
    it('opens the port immediately', function (done) {
      this.port = new SerialPort('/dev/exists', function (err) {
        expect(err).to.not.be.ok;
        done();
      });
    });

    it('emits the open event', function (done) {
      var port = new SerialPort('/dev/exists');
      port.on('open', done);
    });

    it('emits an error on the factory when erroring without a callback', function (done) {
      // finish the test on error
      MockedSerialPort.once('error', function (err) {
        chai.assert.isDefined(err, 'didn\'t get an error');
        done();
      });

      this.port = new SerialPort('/dev/johnJacobJingleheimerSchmidt');
    });

    it('emits an error on the serialport when explicit error handler present', function (done) {
      var port = new SerialPort('/dev/johnJacobJingleheimerSchmidt');

      port.once('error', function(err) {
        chai.assert.isDefined(err);
        done();
      });
    });

    it('errors with invalid databits', function (done) {
      var errorCallback = function (err) {
        chai.assert.isDefined(err, 'err is not defined');
        done();
      };

      this.port = new SerialPort('/dev/exists', { databits: 19 }, false, errorCallback);
    });

    it('errors with invalid stopbits', function (done) {
      var errorCallback = function (err) {
        chai.assert.isDefined(err, 'err is not defined');
        done();
      };

      this.port = new SerialPort('/dev/exists', { stopbits: 19 }, false, errorCallback);
    });

    it('errors with invalid parity', function (done) {
      var errorCallback = function (err) {
        chai.assert.isDefined(err, 'err is not defined');
        done();
      };

      this.port = new SerialPort('/dev/exists', { parity: 'pumpkins' }, false, errorCallback);
    });

    it('errors with invalid flow control', function (done) {
      var errorCallback = function (err) {
        chai.assert.isDefined(err, 'err is not defined');
        done();
      };

      this.port = new SerialPort('/dev/exists', { flowcontrol: ['pumpkins'] }, false, errorCallback);
    });

    it('allows optional options', function (done) {
      var cb = function () {};
      var port = new SerialPort('/dev/exists', cb);
      expect(typeof port.options).to.eq('object');
      done();
    });
  });

  describe('Functions', function () {
    it('write errors when serialport not open', function (done) {
      var cb = function () {};
      var port = new SerialPort('/dev/exists', false, cb);
      port.write(null, function(err) {
        chai.assert.isDefined(err, 'err is not defined');
        done();
      });
    });

    it('close errors when serialport not open', function (done) {
      var cb = function () {};
      var port = new SerialPort('/dev/exists', false, cb);
      port.close(function(err) {
        chai.assert.isDefined(err, 'err is not defined');
        done();
      });
    });

    it('flush errors when serialport not open', function (done) {
      var cb = function () {};
      var port = new SerialPort('/dev/exists', false, cb);
      port.flush(function(err) {
        chai.assert.isDefined(err, 'err is not defined');
        done();
      });
    });

    it('set errors when serialport not open', function (done) {
      var cb = function () {};
      var port = new SerialPort('/dev/exists', false, cb);
      port.set({}, function(err) {
        chai.assert.isDefined(err, 'err is not defined');
        done();
      });
    });

    it('drain errors when serialport not open', function (done) {
      var cb = function () {};
      var port = new SerialPort('/dev/exists', false, cb);
      port.drain(function(err) {
        chai.assert.isDefined(err, 'err is not defined');
        done();
      });
    });

    it('write should consider 0 to be a valid fd', function(done) {
      var port = new SerialPort('/dev/exists', function() {
        expect(port.fd).to.equal(0);
        port.write(new Buffer(0), done);
      });
    });

    it('flush should consider 0 to be a valid fd', function(done) {
      var port = new SerialPort('/dev/exists', function() {
        expect(port.fd).to.equal(0);
        port.flush(done);
      });
    });

    it('set should consider 0 to be a valid fd', function(done) {
      var port = new SerialPort('/dev/exists', function() {
        expect(port.fd).to.equal(0);
        port.set({}, done);
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

    it('isOpen should consider 0 a valid file descriptor', function(done) {
      var port = new SerialPort('/dev/exists', function() {
        expect(port.fd).to.equal(0);
        expect(port.isOpen()).to.be.true;
        done();
      });
    });
  });

  describe('reading data', function () {
    it('emits data events by default', function (done) {
      var testData = new Buffer('I am a really short string');
      var port = new SerialPort('/dev/exists', function () {
        port.once('data', function(recvData) {
          expect(recvData).to.eql(testData);
          done();
        });
        hardware.emitData('/dev/exists', testData);
      });
    });

    it('calls the dataCallback if set', function (done) {
      var testData = new Buffer('I am a really short string');
      var opt = {
        dataCallback: function (recvData) {
          expect(recvData).to.eql(testData);
          done();
        }
      };
      this.port = new SerialPort('/dev/exists', opt, function () {
        hardware.emitData('/dev/exists', testData);
      });
    });
  });

  describe('#open', function () {
    it('passes the port to the bindings', function (done) {
      var openSpy = sandbox.spy(MockedSerialPort.SerialPortBinding, 'open');
      var port = new SerialPort('/dev/exists', {}, false);
      expect(port.isOpen()).to.be.false;
      port.open(function (err) {
        expect(err).to.not.be.ok;
        expect(port.isOpen()).to.be.true;
        expect(openSpy.calledWith('/dev/exists'));
        done();
      });
    });

    it('calls back an error when opening an invalid port', function (done) {
      var port = new SerialPort('/dev/unhappy', {}, false);
      port.open(function (err) {
        expect(err).to.be.ok;
        done();
      });
    });

    it('emits data after being reopened', function (done) {
      var data = new Buffer('Howdy!');
      var port = new SerialPort('/dev/exists', function () {
        port.close();
        port.open(function () {
          port.once('data', function (res) {
            expect(res).to.eql(data);
            done();
          });
          hardware.emitData('/dev/exists', data);
        });
      });
    });
  });

  describe('close', function () {
    it('fires a close event when it\'s closed', function (done) {
      var port = new SerialPort('/dev/exists', function () {
        var closeSpy = sandbox.spy();
        port.on('close', closeSpy);
        port.close();
        expect(closeSpy.calledOnce);
        expect(port.isOpen()).to.be.false;
        done();
      });
    });

    it('fires a close event after being reopened', function (done) {
      var port = new SerialPort('/dev/exists', function () {
        var closeSpy = sandbox.spy();
        port.on('close', closeSpy);
        port.close();
        port.open();
        port.close();
        expect(closeSpy.calledTwice);
        done();
      });
    });

    it('emits a close event', function (done) {
      var port = new SerialPort('/dev/exists', function () {
        port.on('close', done);
        port.close();
      });
    });

    it('should consider 0 a valid fd', function(done) {
      var port = new SerialPort('/dev/exists', function() {
        expect(port.fd).to.equal(0);
        port.close(function () {
          expect(port.fd).to.be.null;
          done();
        });
      });
    });
  });

  describe('disconnect', function () {
    it('fires a disconnect event', function (done) {
      this.port = new SerialPort('/dev/exists', {
        disconnectedCallback: done
      }, function () {
        hardware.disconnect('/dev/exists');
      });
    });

    it('disconnected closes port', function(done) {
      var port = new SerialPort('/dev/exists', function () {
        expect(port.fd).to.equal(0);
        port.disconnected();
        expect(port.fd).to.be.null;
        expect(port.isOpen()).to.be.false;
        done();
      });
    });

    it('emits a disconnect event', function (done) {
      var port = new SerialPort('/dev/exists', function () {
        port.on('disconnect', function(err) {
          expect(err).to.be.ok;
          done();
        });
        hardware.disconnect('/dev/exists');
      });
    });
  });
});
