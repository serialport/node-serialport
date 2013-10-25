/*jslint node: true */
/*global describe, it */
"use strict";

var parsers = require("../serialport").parsers;
var chai = require("chai");
var sinonChai = require("sinon-chai");
var sinon = require("sinon");

chai.should();
chai.use(sinonChai);

describe("parsers", function () {

  describe("#raw", function () {
    it("emits data exactly as it's written", function () {
      var mockEmitter = { emit: sinon.spy() };
      var data = new Buffer("BOGUS");
      parsers.raw(mockEmitter, data);
      mockEmitter.emit.should.have.been.calledWith("data", data);
    });
  });

  describe("#readline", function () {
    it("emits data events split on a delimiter", function () {
      var parser = parsers.readline();
      var data = new Buffer("I love robots\rEach and Every One\r");
      var mockEmitter = { emit: sinon.spy() };
      parser(mockEmitter, data);
      mockEmitter.emit.should.have.been.calledWith("data", "I love robots");
      mockEmitter.emit.should.have.been.calledWith("data", "Each and Every One");
    });
  });

});