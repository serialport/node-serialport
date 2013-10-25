/*jslint node: true */
/*global describe, it */
"use strict";

var serialPort = require('../serialport');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var sinon = require("sinon");

describe ('error handling', function() {
	
	describe('test SerialPort ctor errors', function() {

		it('creates a new SerialPort with invalid name, opens it, and looks for error callback', function(done) {

			var errorCallback = function(err) {
				chai.assert.isDefined(err);
				done();
			};

			var port = new serialPort.SerialPort('johnJacobJingleheimerSchmidt', null, true, errorCallback);
		});

		it('creates a new SerialPort with invalid name, opens it, and looks for error event', function(done) {

			serialPort.on('error', function(err) {
				chai.assert.isDefined(err);
				serialPort.removeAllListeners('error');
				done();
			});

			var port = new serialPort.SerialPort('johnJacobJingleheimerSchmidt', null, true);
		});

		it('creates a new SerialPort with invalid databits and looks for error callback', function(done) {

			var errorCallback = function(err) {
				chai.assert.isDefined(err);
				done();
			};

			var port = new serialPort.SerialPort('johnJacobJingleheimerSchmidt', { databits : 19 }, false, errorCallback);
		});
	});
});

var parsers = serialPort.parsers;

describe("parsers", function () {

  describe("#raw", function () {
    it("emits data exactly as it's written", function () {
      var mockEmitter = { emit: sinon.spy() };
      var data = new Buffer("BOGUS");
      parsers.raw(mockEmitter, data);
      mockEmitter.emit.calledWith("data", data);
    });
  });

  describe("#readline", function () {
    it("emits data events split on a delimiter", function () {
      var parser = parsers.readline();
      var data = new Buffer("I love robots\rEach and Every One\r");
      var mockEmitter = { emit: sinon.spy() };
      parser(mockEmitter, data);
      mockEmitter.emit.calledWith("data", "I love robots");
      mockEmitter.emit.calledWith("data", "Each and Every One");
    });
  });


	describe('test error handling', function() {

		it('creates a new SerialPort with invalid name, opens it, and looks for error callback', function(done) {

			var errorCallback = function(err) {
				chai.assert.isDefined(err);
				done();
			};

			var port = new serialPort.SerialPort('johnJacobJingleheimerSchmidt', null, true, errorCallback);
		});

		it('creates a new SerialPort with invalid name, opens it, and looks for error event', function(done) {

			serialPort.on('error', function(err) {
				chai.assert.isDefined(err);
				done();
			});

			var port = new serialPort.SerialPort('johnJacobJingleheimerSchmidt', null, true);
		});

		it('creates a new SerialPort with invalid databits and looks for error callback', function(done) {

			var errorCallback = function(err) {
				chai.assert.isDefined(err);
				done();
			};

			var port = new serialPort.SerialPort('johnJacobJingleheimerSchmidt', { databits : 19 }, false, errorCallback);
		});
	});
});