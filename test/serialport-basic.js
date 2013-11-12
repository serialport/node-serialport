"use strict";

var sinon = require("sinon");
var chai = require('chai');
var expect = chai.expect;

var MockedSerialPort = require('../test_mocks/linux-hardware');
var SerialPort = MockedSerialPort.SerialPort;
var hardware = MockedSerialPort.hardware;

// Create a port for fun and profit
hardware.createPort('/dev/exists');

describe('SerialPort', function () {
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('Constructor', function () {
    it("opens the port immediately", function (done) {
      var port = new SerialPort('/dev/exists', function (err) {
        expect(err).to.not.be.ok;
        done();
      });
    });

    it('emits an error on the factory when erroring without a callback', function (done) {
      // finish the test on error
      MockedSerialPort.once('error', function (err) {
        chai.assert.isDefined(err, "didn't get an error");
        done();
      });

      var port = new SerialPort('/dev/johnJacobJingleheimerSchmidt');
    });

    it('errors with invalid databits', function (done) {
      var errorCallback = function (err) {
        chai.assert.isDefined(err, 'err is not defined');
        done();
      };

      var port = new SerialPort('/dev/exists', { databits : 19 }, false, errorCallback);
    });

  });

  describe('reading data', function () {

    it('emits data events by default', function (done) {
      hardware.createPort('/dev/exists'); // clears out any previously written data
      var testData = new Buffer("I am a really short string");
      var port = new SerialPort('/dev/exists', function () {
        port.once('data', function(recvData) {
          expect(recvData).to.eql(testData);
          done();
        });
        hardware.emitData('/dev/exists', testData);
      });
    });

    it('calls the dataCallback if set', function (done) {
      hardware.createPort('/dev/exists'); // clears out any previously written data
      var testData = new Buffer("I am a really short string");
      var opt = {
        dataCallback: function (recvData) {
          expect(recvData).to.eql(testData);
          done();
        }
      };
      var port = new SerialPort('/dev/exists', opt, function () {
        hardware.emitData('/dev/exists', testData);
      });
    });

  });

  describe('#open', function () {

    it('passes the port to the bindings', function (done) {
      var openSpy = sandbox.spy(MockedSerialPort.SerialPortBinding, 'open');
      var port = new SerialPort('/dev/exists', {}, false);
      port.open(function (err) {
        expect(err).to.not.be.ok;
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

    it("emits data after being reopened", function (done) {
      hardware.createPort('/dev/fun');

      var data = new Buffer("Howdy!");
      var port = new SerialPort('/dev/fun', function () {
        port.close();
        port.open(function () {
          port.once('data', function (res) {
            expect(res).to.eql(data);
            done();
          });
          hardware.emitData('/dev/fun', data);
        });
      });
    });

  });

});

