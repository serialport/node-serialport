'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');

var parsers = require('../lib/parsers');

describe('parsers', function() {
  describe('#raw', function() {
    it('emits data exactly as it\'s written', function() {
      var data = new Buffer('BOGUS');
      var spy = sinon.spy();
      parsers.raw({ emit: spy }, data);
      assert.deepEqual(spy.getCall(0).args[1], new Buffer('BOGUS'));
    });
  });

  describe('#readline', function() {
    it('emits data events split on a delimiter', function() {
      var data = new Buffer('I love robots\rEach and Every One\r');
      var spy = sinon.spy();
      var parser = parsers.readline();
      parser({ emit: spy }, data);
      assert(spy.calledWith('data', 'I love robots'));
      assert(spy.calledWith('data', 'Each and Every One'));
    });
  });

  describe('#byteLength', function() {
    it('emits data events every 8 bytes', function() {
      var data = new Buffer('Robots are so freaking cool!');
      var spy = sinon.spy();
      var parser = parsers.byteLength(8);
      parser({ emit: spy }, data);
      assert.equal(spy.callCount, 3);
      assert.deepEqual(spy.getCall(0).args[1], new Buffer('Robots a'));
      assert.deepEqual(spy.getCall(1).args[1], new Buffer('re so fr'));
      assert.deepEqual(spy.getCall(2).args[1], new Buffer('eaking c'));
    });
  });

  describe('#rawdelimiter', function() {
    it('emits data events every time it meets 00x 00x', function() {
      var data = new Buffer('This could be\0\0binary data\0\0sent from a Moteino\0\0');
      var parser = parsers.byteDelimiter([0, 0]);
      var spy = sinon.spy();
      parser({ emit: spy }, data);
      assert.equal(spy.callCount, 3);
      assert.equal(spy.getCall(0).args[1].length, 15);
      assert.deepEqual(new Buffer(spy.getCall(0).args[1]), (new Buffer('This could be\0\0')));
      assert.equal(spy.getCall(1).args[1].length, 13);
      assert.deepEqual(new Buffer(spy.getCall(1).args[1]), (new Buffer('binary data\0\0')));
      assert.equal(spy.getCall(2).args[1].length, 21);
      assert.deepEqual(new Buffer(spy.getCall(2).args[1]), (new Buffer('sent from a Moteino\0\0')));
    });

    it('accepts single byte delimiter', function() {
      var data = new Buffer('This could be\0binary data\0sent from a Moteino\0');
      var parser = parsers.byteDelimiter(0);
      var spy = sinon.spy();
      parser({ emit: spy }, data);
      assert.equal(spy.callCount, 3);
    });

    it('Works when buffer starts with delimiter', function() {
      var data = new Buffer('\0Hello\0World\0');
      var parser = parsers.byteDelimiter(0);
      var spy = sinon.spy();
      parser({ emit: spy }, data);
      assert.equal(spy.callCount, 3);
    });

    it('should only emit if delimiters are strictly in row', function() {
      var data = new Buffer('\0Hello\u0001World\0\0\u0001');
      var parser = parsers.byteDelimiter([0, 1]);
      var spy = sinon.spy();
      parser({ emit: spy }, data);
      assert.equal(spy.callCount, 1);
    });

    it('continues looking for delimiters in the next buffers', function() {
      var data1 = new Buffer('This could be\0\0binary ');
      var data2 = new Buffer('data\0\0sent from a Moteino\0\0');
      var parser = parsers.byteDelimiter([0, 0]);
      var spy = sinon.spy();
      parser({ emit: spy }, data1);
      parser({ emit: spy }, data2);
      assert.equal(spy.callCount, 3);
      assert.equal(spy.getCall(0).args[1].length, 15);
      assert.deepEqual(new Buffer(spy.getCall(0).args[1]), (new Buffer('This could be\0\0')));
      assert.equal(spy.getCall(1).args[1].length, 13);
      assert.deepEqual(new Buffer(spy.getCall(1).args[1]), (new Buffer('binary data\0\0')));
      assert.equal(spy.getCall(2).args[1].length, 21);
      assert.deepEqual(new Buffer(spy.getCall(2).args[1]), (new Buffer('sent from a Moteino\0\0')));
    });
  });
});
