'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinonChai = require('sinon-chai');
var sinon = require('sinon');
chai.use(sinonChai);

var parsers = require('../parsers');

describe('parsers', function () {

  describe('#raw', function () {
    it('emits data exactly as it\'s written', function () {
      var data = new Buffer('BOGUS');
      var spy = sinon.spy();
      parsers.raw({ emit: spy }, data);
      expect(spy.getCall(0).args[1]).to.deep.equal(new Buffer('BOGUS'));
    });
  });

  describe('#readline', function () {
    it('emits data events split on a delimiter', function () {
      var data = new Buffer('I love robots\rEach and Every One\r');
      var spy = sinon.spy();
      var parser = parsers.readline();
      parser({ emit: spy }, data);
      expect(spy).to.have.been.calledWith('data', 'I love robots');
      expect(spy).to.have.been.calledWith('data', 'Each and Every One');
    });
  });

  describe('#byteLength', function(){
    it('emits data events every 8 bytes', function () {
      var data = new Buffer('Robots are so freaking cool!');
      var spy = sinon.spy();
      var parser = parsers.byteLength(8);
      parser({ emit: spy }, data);
      expect(spy.callCount).to.equal(3);
      expect(spy.getCall(0).args[1].length).to.equal(8);
      expect(spy.getCall(0).args[1]).to.deep.equal(new Buffer('Robots a'));
      expect(spy.getCall(1).args[1]).to.deep.equal(new Buffer('re so fr'));
      expect(spy.getCall(2).args[1]).to.deep.equal(new Buffer('eaking c'));
    });
  });

  describe('#rawdelimiter', function() {
    it('emits data events every time it meets 00x 00x', function() {
      var data = new Buffer('This could be\0\0binary data\0\0sent from a Moteino\0\0');
      var parser = parsers.byteDelimiter([0, 0]);
      var spy = sinon.spy();
      parser({ emit: spy }, data);
      expect(spy.callCount).to.equal(3);
      expect(spy.getCall(0).args[1]).to.have.length(15);
      expect(spy.getCall(0).args[1]).to.satisfy(function(d) { return d[d.length-1] === 0; });
      expect(spy.getCall(1).args[1]).to.have.length(13);
      expect(spy.getCall(1).args[1]).to.satisfy(function(d) { return d[d.length-1] === 0; });
      expect(spy.getCall(2).args[1]).to.have.length(21);
      expect(spy.getCall(2).args[1]).to.satisfy(function(d) { return d[d.length-1] === 0; });
    });
    it('accepts single byte delimiter', function() {
      var data = new Buffer('This could be\0binary data\0sent from a Moteino\0');
      var parser = parsers.byteDelimiter(0);
      var spy = sinon.spy();      
      parser({ emit: spy }, data);
      expect(spy.callCount).to.equal(3);
    });
    it('Works when buffer starts with delimiter', function() {
      var data = new Buffer('\0Hello\0World\0');
      var parser = parsers.byteDelimiter(0);
      var spy = sinon.spy();      
      parser({ emit: spy }, data);
      expect(spy.callCount).to.equal(3);
    });
    it('continues looking for delimiters in the next buffers', function() {
      var data1 = new Buffer('This could be\0\0binary ');
      var data2 = new Buffer('data\0\0sent from a Moteino\0\0');
      var parser = parsers.byteDelimiter([0,0]);
      var spy = sinon.spy();      
      parser({ emit: spy }, data1);
      parser({ emit: spy }, data2);
      expect(spy.callCount).to.equal(3);
      expect(spy.getCall(0).args[1]).to.have.length(15);
      expect(spy.getCall(0).args[1]).to.satisfy(function(d) { return d[d.length-1] === 0; });
      expect(spy.getCall(1).args[1]).to.have.length(13);
      expect(spy.getCall(1).args[1]).to.satisfy(function(d) { return d[d.length-1] === 0; });
      expect(spy.getCall(2).args[1]).to.have.length(21);
      expect(spy.getCall(2).args[1]).to.satisfy(function(d) { return d[d.length-1] === 0; });
    });
  });
});
