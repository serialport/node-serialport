'use strict';
/* eslint-disable no-new */

const assert = require('chai').assert;
const sinon = require('sinon');

const ByteLengthParser = require('../lib/parser-byte-length');

describe('ByteLengthParser', function() {
  it('works without new', function() {
    // eslint-disable-next-line new-cap
    const parser = ByteLengthParser({ length: 4 });
    assert.instanceOf(parser, ByteLengthParser);
  });

  it('emits data events every 8 bytes', function() {
    const data = new Buffer('Robots are so freaking cool!');
    const spy = sinon.spy();
    const parser = new ByteLengthParser({ length: 8 });
    parser.on('data', spy);
    parser.write(data);
    assert.equal(spy.callCount, 3);
    assert.deepEqual(spy.getCall(0).args[0], new Buffer('Robots a'));
    assert.deepEqual(spy.getCall(1).args[0], new Buffer('re so fr'));
    assert.deepEqual(spy.getCall(2).args[0], new Buffer('eaking c'));
  });

  it('throws when not provided with a length', function() {
    assert.throws(function() {
      new ByteLengthParser({});
    });
  });

  it('throws when length is zero', function() {
    assert.throws(function() {
      new ByteLengthParser({
        length: 0
      });
    });
  });

  it('throws when called with a non numeric length', function() {
    assert.throws(function() {
      new ByteLengthParser({
        length: 'foop'
      });
    });
  });

  it('continues looking for bytes in additional writes', function() {
    const parser = new ByteLengthParser({ length: 4 });
    const spy = sinon.spy();
    parser.on('data', spy);
    parser.write(new Buffer('ab'));
    parser.write(new Buffer('cd'));
    assert.equal(spy.callCount, 1);
    assert.deepEqual(spy.getCall(0).args[0], new Buffer('abcd'));
  });
});

