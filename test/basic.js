/*jslint node: true */
/*global describe, it */
"use strict";

var chai = require('chai');
var serialPort = require('../serialport');

describe ('basics', function() {
	
	describe('echo hello', function() {
		it('sends hello to the last port and validates that it is received back (see arduinoEcho.ino for echo sketch)', function(done) {
			serialPort.list(function(err, ports) {

				chai.assert.isUndefined(err);
				chai.assert.isDefined(ports);
				chai.assert.isTrue(ports.length > 0);

				var data = new Buffer("hello");

				var port = new serialPort.SerialPort(ports.slice(-1)[0].comName, null, false);
				port.on('error', function(err) { chai.assert.fail(err); });

				port.on('data', function(d) {
					chai.assert.equal(data.toString(), d.toString());
					port.close(function(err) {
						chai.assert.isUndefined(err);
						done();
					});
				});

				port.open(function(err) {
					chai.assert.isUndefined(err);
					port.write(data);
				});
			});
		});
	});

	describe('relaxed baud rate', function() {
		it('opens a port with a non-standard baud rate', function(done) {
			serialPort.list(function(err, ports) {

				chai.assert.isUndefined(err);
				chai.assert.isDefined(ports);
				chai.assert.isTrue(ports.length > 0);

				var port = new serialPort.SerialPort(ports.slice(-1)[0].comName, {baudrate: 5}, false);
				port.on('error', function(err) { chai.assert.fail(err); });

				port.open(function(err) {
					chai.assert.isUndefined(err);
					port.close(function(err) {
						chai.assert.isUndefined(err);
						done();
					});
				});
			});
		});
	});

	describe('simple write', function() {
		it('opens a port and sends data without encountering error', function(done) {
			serialPort.list(function(err, ports) {

				chai.assert.isUndefined(err);
				chai.assert.isDefined(ports);
				chai.assert.isTrue(ports.length > 0);

				var data = new Buffer("hello");

				var port = new serialPort.SerialPort(ports.slice(-1)[0].comName, null, false);
				port.on('error', function(err) { chai.assert.fail(err); });

				port.open(function(err) {
					chai.assert.isUndefined(err);
					port.write(data);
					port.close(function(err) {
						chai.assert.isUndefined(err);
						done();
					});
				});
			});
		});
	});
});