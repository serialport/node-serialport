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
    if (process.version.indexOf("v0.11.") ===0) {
      it("does not currently work due to an issue with node unstable release, works in master.", function (done) {
        done();
      });
    } else {
      it("Throws an error in callback when trying to open an invalid port", function (done) {
        var SerialPort = require('../').SerialPort;
        var port = new SerialPort('/dev/nullbad', function (err) {
          chai.assert.isDefined(err, "didn't get an error");
          done();
        });
      });
    }
  });

});