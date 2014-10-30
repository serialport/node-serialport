"use strict";

var chai = require('chai');
var expect = chai.expect;
var sinonChai = require("sinon-chai");
var sinon = require("sinon");
chai.use(sinonChai);

var parsers = require('../parsers');

describe("parsers", function () {

  describe("#raw", function () {
    it("emits data exactly as it's written", function () {
      var data = new Buffer("BOGUS");
      var spy = sinon.spy();
      parsers.raw({ emit: spy }, data);
      expect(spy.getCall(0).args[1]).to.deep.equal(new Buffer("BOGUS"));
    });
  });

  describe("#readline", function () {
    it("emits data events split on a delimiter", function () {
      var data = new Buffer("I love robots\rEach and Every One\r");
      var spy = sinon.spy();
      var parser = parsers.readline();
      parser({ emit: spy }, data);
      expect(spy).to.have.been.calledWith("data", "I love robots");
      expect(spy).to.have.been.calledWith("data", "Each and Every One");
    });
  });

  describe('#byteLength', function(){
    it("emits data events every 8 bytes", function () {
      var data = new Buffer("Robots are so freaking cool!");
      var spy = sinon.spy();
      var parser = parsers.byteLength(8);
      parser({ emit: spy }, data);
      expect(spy.callCount).to.equal(3);
      expect(spy.getCall(0).args[1].length).to.equal(8);
      expect(spy.getCall(0).args[1]).to.deep.equal(new Buffer("Robots a"));
      expect(spy.getCall(1).args[1]).to.deep.equal(new Buffer("re so fr"));
      expect(spy.getCall(2).args[1]).to.deep.equal(new Buffer("eaking c"));
    });
  });

});