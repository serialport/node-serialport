"use strict";

var chai = require('chai');
var sinonChai = require("sinon-chai");
var sinon = require("sinon");

var parsers = require('../parsers');

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

});