"use strict";

var sinon = require("sinon");
var chai = require('chai');
var expect = chai.expect;

describe('SerialPort', function () {
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('Initialization', function () {
    it("Throws an error in callback when trying to open an invalid port", function (done) {
      var SerialPort = require('../').SerialPort;
      var port = new SerialPort('/dev/nullbad', function (err) {
        chai.assert.isDefined(err, "didn't get an error");
        done();
      });
    });
  });

});