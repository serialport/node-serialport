'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');

var ReadLineParser = require('../lib/parser-read-line');

describe('ReadLineParser', function() {
  it('transforms data to strings split on a delimiter', function() {
    var spy = sinon.spy();
    var parser = new ReadLineParser();
    parser.on('data', spy);
    parser.write(new Buffer('I love robots\nEach '));
    parser.write(new Buffer('and Every One\n'));
    parser.write(new Buffer('even you!'));
    assert(spy.calledWith('I love robots'));
    assert(spy.calledWith('Each and Every One'));
    assert(spy.calledTwice);
    parser.end();
    assert(spy.calledWith('even you!'));
    assert(spy.calledThrice);
  });

  it('allows setting of the delimiter with a string', function() {
    var spy = sinon.spy();
    var parser = new ReadLineParser({delimiter: 'a'});
    parser.on('data', spy);
    parser.write(new Buffer('how are youa'));
    assert(spy.calledWith('how '));
    assert(spy.calledWith('re you'));
  });

  it('allows setting of the delimiter with a buffer', function() {
    var spy = sinon.spy();
    var parser = new ReadLineParser({delimiter: new Buffer('a')});
    parser.on('data', spy);
    parser.write(new Buffer('how are youa'));
    assert(spy.calledWith('how '));
    assert(spy.calledWith('re you'));
  });

  it('allows setting of the delimiter with an array of bytes', function() {
    var spy = sinon.spy();
    var parser = new ReadLineParser({delimiter: [97]});
    parser.on('data', spy);
    parser.write(new Buffer('how are youa'));
    assert(spy.calledWith('how '));
    assert(spy.calledWith('re you'));
  });

  it('allows setting of encoding', function() {
    var spy = sinon.spy();
    var parser = new ReadLineParser({
      encoding: 'hex'
    });
    parser.on('data', spy);
    parser.write(new Buffer('a\nb\n'));
    assert.equal(spy.getCall(0).args[0], '61');
    assert.equal(spy.getCall(1).args[0], '62');
  });

  it('encoding should be reflected in a string delimiter', function() {
    var spy = sinon.spy();
    var parser = new ReadLineParser({
      delimiter: 'FF',
      encoding: 'hex'
    });
    parser.on('data', spy);
    parser.write(new Buffer([0, 255, 1, 255]));
    assert.equal(spy.getCall(0).args[0], '00');
    assert.equal(spy.getCall(1).args[0], '01');
  });

  it('throws when called with a 0 length delimiter', function() {
    assert.throws(function() {
      new ReadLineParser({
        delimiter: new Buffer(0)
      });
    });

    assert.throws(function() {
      new ReadLineParser({
        delimiter: ''
      });
    });

    assert.throws(function() {
      new ReadLineParser({
        delimiter: []
      });
    });
  });

  it('allows setting of the delimiter with a string', function() {
    new ReadLineParser({delimiter: 'string'});
  });

  it('allows setting of the delimiter with a buffer', function() {
    new ReadLineParser({delimiter: new Buffer([1])});
  });

  it('allows setting of the delimiter with an array of bytes', function() {
    new ReadLineParser({delimiter: [1]});
  });

  it('doesn\'t emits empty data events', function() {
    var spy = sinon.spy();
    var parser = new ReadLineParser({delimiter: 'a'});
    parser.on('data', spy);
    parser.write(new Buffer('aFa'));
    assert(spy.calledOnce);
    assert(spy.calledWith('F'));
  });
});
