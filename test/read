"use strict";

var serialPort = require('../serialport');
var sinon = require("sinon");
var chai = require('chai');
var mockBinding = require('../test_mocks/serial-port-binding');

var expect = chai.expect;
var SerialPort = serialPort.SerialPort;
serialPort.SerialPortBinding = mockBinding;

describe('SerialPort', function () {

  var port;

  describe('opening a port and writing some bytes', function () {

    it("it should emit the expected answer bytes", function (done) {
      port = new SerialPort('/dev/fun', {}, false);
      port.open(function() {
        
        var data = new Buffer([1, 2, 3, 4]);

        port.once('data', function(res) {
          expect(res).to.eql(data);
          done();
        });

        port.write(data, function() {
        });
      });
    });

    describe('closing and reopening the previously used port and writing some bytes', function () {

      before(function(done) {
        port.close(done);
      });

      it("it should emit the expected answer bytes again", function (done) {
        port.open(function() {
          
          var data = new Buffer([5, 6, 7, 8]);

          port.once('data', function(res) {
            expect(res).to.eql(data);
            done();
          });

          port.write(data, function() {
          });
        });
      });

    });

  });

});

