'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');

var DelimiterParser = require('../lib/parser-delimiter');

describe('DelimiterParser', function() {
  it('transforms data to strings split on a delimiter', function() {
    var spy = sinon.spy();
    var parser = new DelimiterParser({
      delimiter: new Buffer('\n')
    });
    parser.on('data', spy);
    parser.write(new Buffer('I love robots\nEach '));
    parser.write(new Buffer('and Every One\n'));
    parser.write(new Buffer('even you!'));

    assert.deepEqual(spy.getCall(0).args[0], new Buffer('I love robots'));
    assert.deepEqual(spy.getCall(1).args[0], new Buffer('Each and Every One'));
    assert(spy.calledTwice);
    parser.end();
    assert.deepEqual(spy.getCall(2).args[0], new Buffer('even you!'));
    assert(spy.calledThrice);
  });

  it('throws when not provided with a delimiter', function() {
    assert.throws(function() {
      new DelimiterParser({});
    });
  });

  it('throws when called with a 0 length delimiter', function() {
    assert.throws(function() {
      new DelimiterParser({
        delimiter: new Buffer(0)
      });
    });

    assert.throws(function() {
      new DelimiterParser({
        delimiter: ''
      });
    });

    assert.throws(function() {
      new DelimiterParser({
        delimiter: []
      });
    });
  });

  it('allows setting of the delimiter with a string', function() {
    new DelimiterParser({delimiter: 'string'});
  });

  it('allows setting of the delimiter with a buffer', function() {
    new DelimiterParser({delimiter: new Buffer([1])});
  });

  it('allows setting of the delimiter with an array of bytes', function() {
    new DelimiterParser({delimiter: [1]});
  });

  it('emits data events every time it meets 00x 00x', function() {
    var data = new Buffer('This could be\0\0binary data\0\0sent from a Moteino\0\0');
    var parser = new DelimiterParser({delimiter: [0, 0]});
    var spy = sinon.spy();
    parser.on('data', spy);
    parser.write(data);
    assert.equal(spy.callCount, 3);
    assert.deepEqual(spy.getCall(0).args[0], new Buffer('This could be'));
    assert.deepEqual(spy.getCall(1).args[0], new Buffer('binary data'));
    assert.deepEqual(spy.getCall(2).args[0], new Buffer('sent from a Moteino'));
  });

  it('accepts single byte delimiter', function() {
    var data = new Buffer('This could be\0binary data\0sent from a Moteino\0');
    var parser = new DelimiterParser({delimiter: [0]});
    var spy = sinon.spy();
    parser.on('data', spy);
    parser.write(data);
    assert.equal(spy.callCount, 3);
  });

  it('Works when buffer starts with delimiter', function() {
    var data = new Buffer('\0Hello\0World\0');
    var parser = new DelimiterParser({delimiter: new Buffer([0])});
    var spy = sinon.spy();
    parser.on('data', spy);
    parser.write(data);
    assert.equal(spy.callCount, 2);
  });

  it('should only emit if delimiters are strictly in row', function() {
    var data = new Buffer('\0Hello\u0001World\0\0\u0001');
    var parser = new DelimiterParser({delimiter: [0, 1]});
    var spy = sinon.spy();
    parser.on('data', spy);
    parser.write(data);
    assert.equal(spy.callCount, 1);
  });

  it('continues looking for delimiters in the next buffers', function() {
    var parser = new DelimiterParser({delimiter: [0, 0]});
    var spy = sinon.spy();
    parser.on('data', spy);
    parser.write(new Buffer('This could be\0\0binary '));
    parser.write(new Buffer('data\0\0sent from a Moteino\0\0'));
    assert.equal(spy.callCount, 3);
    assert.deepEqual(spy.getCall(0).args[0], new Buffer('This could be'));
    assert.deepEqual(spy.getCall(1).args[0], new Buffer('binary data'));
    assert.deepEqual(spy.getCall(2).args[0], new Buffer('sent from a Moteino'));
  });
});

