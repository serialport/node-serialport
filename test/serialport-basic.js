'use strict';

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var should = chai.should();
var expect = chai.expect;

chai.use(sinonChai);

var MockedSerialPort = require('../test_mocks/linux-hardware');
var SerialPort = MockedSerialPort.SerialPort;
var hardware = MockedSerialPort.hardware;
var stream = require('readable-stream');

describe('SerialPort', function () {
  var sandbox;
  var existPath = '/dev/exists';

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    // Create a port for fun and profit
    hardware.reset();
    hardware.createPort(existPath);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('Constructor', function () {
    it('should be a Duplex stream', function() {
      var port = new SerialPort(existPath);
      port.should.be.an.instanceOf(stream.Duplex);
    });

    it('should call the Duplex constructor', function() {
      var spy = sinon.spy(stream, 'Duplex');

      new SerialPort(existPath);

      spy.should.have.been.calledOnce;
    });

    it('throws when path is invalid', function() {
      [undefined, null, ''].forEach(function(path) {
        expect(function() {
          new SerialPort(path);
        }).to.throw(/Invalid port/);
      });
    });

    it('opens the port immediately', function (done) {
      var port = new SerialPort(existPath, function (err) {
        expect(err).to.not.exist;
        done();
      });
    });

    it('emits an error on the factory when erroring without a callback', function (done) {
      // finish the test on error
      MockedSerialPort.once('error', function (err) {
        expect(err).to.exist;
        done();
      });

      var port = new SerialPort('/dev/johnJacobJingleheimerSchmidt');
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

      var port = new SerialPort(existPath, { databits : 19 }, false, errorCallback);
    });

    it('allows optional options', function (done) {
      var cb = function () {};
      var port = new SerialPort(existPath, cb);
      expect(typeof port.options).to.eq('object');
      done();
    });

  });

  describe('reading data', function () {

    it('emits data events by default', function (done) {
      var testData = new Buffer('I am a really short string');
      var port = new SerialPort(existPath, function () {
        port.once('data', function(recvData) {
          expect(recvData).to.eql(testData);
          done();
        });
        hardware.emitData(existPath, testData);
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
      var port = new SerialPort(existPath, opt, function () {
        hardware.emitData(existPath, testData);
      });
    });

  });

  describe('#open', function () {

    it('passes the port to the bindings', function (done) {
      var openSpy = sandbox.spy(MockedSerialPort.SerialPortBinding, 'open');
      var port = new SerialPort(existPath, {}, false);
      port.open(function (err) {
        expect(err).to.not.exist;
        expect(openSpy.calledWith(existPath));
        done();
      });
    });

    it('calls back an error when opening an invalid port', function (done) {
      var port = new SerialPort('/dev/unhappy', {}, false);
      port.open(function (err) {
        expect(err).to.exits;
        done();
      });
    });

    it('emits error event when opening an invalid port', function(done) {
      var port = new SerialPort('/dev/unhappy', {}, false);
      var stub = sinon.stub();
      
      port.on('error', stub);

      port.open();

      process.nextTick(function() {
        stub.should.have.been.calledOnce;
        done();
      });
    });

    it('emits global error event when opening an invalid port', function(done) {
      var port = new SerialPort('/dev/unhappy', {}, false);
      var stub = sinon.stub();
      
      MockedSerialPort.on('error', stub);

      port.open();

      process.nextTick(function() {
        stub.should.have.been.calledOnce;
        done();
      });
    });

    it('emits data after being reopened', function (done) {
      var data = new Buffer('Howdy!');
      var port = new SerialPort(existPath, function () {
        port.close();
        port.open(function () {
          port.once('data', function (res) {
            expect(res).to.eql(data);
            done();
          });
          hardware.emitData(existPath, data);
        });
      });
    });

  });

  describe('close', function () {
    it('fires a close event when it is closed', function (done) {
      var port = new SerialPort(existPath, function () {
        var closeSpy = sandbox.spy();
        port.on('close', closeSpy);
        port.close();
        expect(closeSpy.calledOnce);
        done();
      });
    });

    it('fires a close event after being reopened', function (done) {
      var port = new SerialPort(existPath, function () {
        var closeSpy = sandbox.spy();
        port.on('close', closeSpy);
        port.close();
        port.open();
        port.close();
        expect(closeSpy.calledTwice);
        done();
      });
    });
  });

  describe('disconnect', function () {
    it('fires a disconnect event', function (done) {
      var port = new SerialPort(existPath, {
        disconnectedCallback: function (err) {
          expect(err).to.not.be.ok;
          done();
        }
      }, function () {
        hardware.disconnect(existPath);
      });
    });
  });

});

