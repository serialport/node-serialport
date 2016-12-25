'use strict';
/* eslint-disable no-new */

const assert = require('chai').assert;
const sinon = require('sinon');

const ReadlineParser = require('../lib/parser-readline');

describe('ReadlineParser', () => {
  it('works without new', () => {
    // eslint-disable-next-line new-cap
    const parser = ReadlineParser();
    assert.instanceOf(parser, ReadlineParser);
  });

  it('transforms data to strings split on a delimiter', () => {
    const spy = sinon.spy();
    const parser = new ReadlineParser();
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

  it('allows setting of the delimiter with a string', () => {
    const spy = sinon.spy();
    const parser = new ReadlineParser({ delimiter: 'a' });
    parser.on('data', spy);
    parser.write(new Buffer('how are youa'));
    assert(spy.calledWith('how '));
    assert(spy.calledWith('re you'));
  });

  it('allows setting of the delimiter with a buffer', () => {
    const spy = sinon.spy();
    const parser = new ReadlineParser({ delimiter: new Buffer('a') });
    parser.on('data', spy);
    parser.write(new Buffer('how are youa'));
    assert(spy.calledWith('how '));
    assert(spy.calledWith('re you'));
  });

  it('allows setting of the delimiter with an array of bytes', () => {
    const spy = sinon.spy();
    const parser = new ReadlineParser({ delimiter: [97] });
    parser.on('data', spy);
    parser.write(new Buffer('how are youa'));
    assert(spy.calledWith('how '));
    assert(spy.calledWith('re you'));
  });

  it('allows setting of encoding', () => {
    const spy = sinon.spy();
    const parser = new ReadlineParser({
      encoding: 'hex'
    });
    parser.on('data', spy);
    parser.write(new Buffer('a\nb\n'));
    assert.equal(spy.getCall(0).args[0], '61');
    assert.equal(spy.getCall(1).args[0], '62');
  });

  it('encoding should be reflected in a string delimiter', () => {
    const spy = sinon.spy();
    const parser = new ReadlineParser({
      delimiter: 'FF',
      encoding: 'hex'
    });
    parser.on('data', spy);
    parser.write(new Buffer([0, 255, 1, 255]));
    assert.equal(spy.getCall(0).args[0], '00');
    assert.equal(spy.getCall(1).args[0], '01');
  });

  it('throws when called with a 0 length delimiter', () => {
    assert.throws(() => {
      new ReadlineParser({
        delimiter: new Buffer(0)
      });
    });

    assert.throws(() => {
      new ReadlineParser({
        delimiter: ''
      });
    });

    assert.throws(() => {
      new ReadlineParser({
        delimiter: []
      });
    });
  });

  it('allows setting of the delimiter with a string', () => {
    new ReadlineParser({ delimiter: 'string' });
  });

  it('allows setting of the delimiter with a buffer', () => {
    new ReadlineParser({ delimiter: new Buffer([1]) });
  });

  it('allows setting of the delimiter with an array of bytes', () => {
    new ReadlineParser({ delimiter: [1] });
  });

  it('doesn\'t emits empty data events', () => {
    const spy = sinon.spy();
    const parser = new ReadlineParser({ delimiter: 'a' });
    parser.on('data', spy);
    parser.write(new Buffer('aFa'));
    assert(spy.calledOnce);
    assert(spy.calledWith('F'));
  });
});
