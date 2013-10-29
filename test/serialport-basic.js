"use strict";

var serialPort = require('../serialport');
var sinon = require("sinon");
var chai = require('chai');
var mockBinding = require('../test_mocks/serial-port-binding');

var expect = chai.expect;
var SerialPort = serialPort.SerialPort;
serialPort.SerialPortBinding = mockBinding;

describe('SerialPort', function () {

  describe('Constructor', function () {
    it("opens the port immediately", function (done) {
      var port = new SerialPort('/dev/fun', function (err) {
        expect(err).to.not.be.ok;
        done();
      });
    });


    it('emits an error on the factory when erroring without a callback', function (done) {
      // setup the bindings to report an error during open
      var stubOpen = sinon.stub(mockBinding, 'open', function (path, opt, cb) {
        cb('fakeErrr!');
      });

      // finish the test on error
      serialPort.once('error', function (err) {
        chai.assert.isDefined(err, "didn't get an error");
        stubOpen.restore();
        done();
      });

      var port = new SerialPort('johnJacobJingleheimerSchmidt');
    });

    it('errors with invalid databits', function (done) {

      var errorCallback = function (err) {
        chai.assert.isDefined(err, 'err is not defined');
        done();
      };

      var port = new SerialPort('johnJacobJingleheimerSchmidt', { databits : 19 }, false, errorCallback);
    });

  });

  describe('#open', function () {

    it('passes the port to the bindings', function (done) {
      var openSpy = sinon.spy(mockBinding, 'open');
      var port = new SerialPort('/dev/happyPort', {}, false);
      port.open(function (err) {
        expect(err).to.not.be.ok;
        expect(openSpy.calledWith('/dev/happyPort'));
        openSpy.restore();
        done();
      });

    });

    it('calls back an error when opening an invalid port', function (done) {
      var stubOpen = sinon.stub(mockBinding, 'open', function (path, opt, cb) {
        cb('fakeErrr!');
      });

      var port = new SerialPort('johnJacobJingleheimerSchmidt', {}, false);
      port.open(function (err) {
        expect(err).to.be.ok;
        done();
      });

      stubOpen.restore();
    });


  });

});

