'use strict';
/* eslint-disable no-new */

const Buffer = require('safe-buffer').Buffer;
const sinon = require('sinon');

const RegexParser = require('../lib/parsers/regex');

describe('RegexParser', () => {
  it('works without new', () => {
    // eslint-disable-next-line new-cap
    const parser = RegexParser({ delimiter: Buffer.from([0]) });
    assert.instanceOf(parser, RegexParser);
  });

  it('transforms data to strings split on either carriage return or new line', () => {
    const spy = sinon.spy();
    const parser = new RegexParser({
      delimiter: new RegExp(/\r\n|\n\r|\n|\r/)
    });
    parser.on('data', spy);
    parser.write(Buffer.from('I love robots\n\rEach '));
    parser.write(Buffer.from('and Every One\r'));
    parser.write(Buffer.from('even you!'));

    assert.deepEqual(spy.getCall(0).args[0], 'I love robots');
    assert.deepEqual(spy.getCall(1).args[0], 'Each and Every One');
    assert(spy.calledTwice);
  });

  it('flushes remaining data when the stream ends', () => {
    const parser = RegexParser({ delimiter: /\n/ });
    const spy = sinon.spy();
    parser.on('data', spy);
    parser.write(Buffer.from([1]));
    assert.equal(spy.callCount, 0);
    parser.end();
    assert.equal(spy.callCount, 1);
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([1]).toString());
  });

  it('throws when not provided with a delimiter', () => {
    assert.throws(() => {
      new RegexParser({});
    });
  });

  it('throws when called with a 0 length delimiter', () => {
    assert.throws(() => {
      new RegexParser({
        delimiter: Buffer.alloc(0)
      });
    });

    assert.throws(() => {
      new RegexParser({
        delimiter: ''
      });
    });

    assert.throws(() => {
      new RegexParser({
        delimiter: []
      });
    });
  });

  it('allows setting of the delimiter with a regex string', () => {
    const spy = sinon.spy();
    const parser = new RegexParser({ delimiter: 'a|b' });
    parser.on('data', spy);
    parser.write('bhow are youa');
    assert(spy.calledWith('how '));
    assert(spy.calledWith('re you'));
  });

  it('allows setting of the delimiter with a buffer', () => {
    const parser = new RegexParser({ delimiter: Buffer.from('a|b') });
    const spy = sinon.spy();
    parser.on('data', spy);
    parser.write('bhow are youa');
    assert(spy.calledWith('how '));
    assert(spy.calledWith('re you'));
  });

  it('allows setting of encoding', () => {
    const spy = sinon.spy();
    const parser = new RegexParser({
      delimiter: /\r/,
      encoding: 'hex'
    });
    parser.on('data', spy);
    parser.write(Buffer.from('a\rb\r'));
    assert.equal(spy.getCall(0).args[0], '61');
    assert.equal(spy.getCall(1).args[0], '62');
  });

  it('Works when buffer starts with regex delimiter', () => {
    const data = Buffer.from('\rHello\rWorld\r');
    const parser = new RegexParser({ delimiter: /\r/ });
    const spy = sinon.spy();
    parser.on('data', spy);
    parser.write(data);
    assert.equal(spy.callCount, 2);
  });

  it('should match unicode in buffer string', () => {
    const data = Buffer.from('\u000aHello\u000aWorld\u000d\u000a!');
    const parser = new RegexParser({ delimiter: /\r\n|\n/ });
    const spy = sinon.spy();
    parser.on('data', spy);
    parser.write(data);
    assert.equal(spy.callCount, 2);
  });

  it('continues looking for delimiters in the next buffers', () => {
    const parser = new RegexParser({ delimiter: /\r\n|\n/ });
    const spy = sinon.spy();
    parser.on('data', spy);
    parser.write(Buffer.from('This could be\na poem '));
    parser.write(Buffer.from('or prose\r\nsent from a robot\r\n'));
    assert.equal(spy.callCount, 3);
    assert.deepEqual(spy.getCall(0).args[0], 'This could be');
    assert.deepEqual(spy.getCall(1).args[0], 'a poem or prose');
    assert.deepEqual(spy.getCall(2).args[0], 'sent from a robot');
  });

  it('doesn\'t emits empty data events', () => {
    const spy = sinon.spy();
    const parser = new RegexParser({ delimiter: /a|b/ });
    parser.on('data', spy);
    parser.write(Buffer.from('abaFab'));
    assert(spy.calledOnce);
    assert(spy.calledWith('F'));
  });
});
