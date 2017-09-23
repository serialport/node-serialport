'use strict';
/* eslint-disable no-new */

const Buffer = require('safe-buffer').Buffer;
const sinon = require('sinon');
const CCTalkParser = require('../lib/parsers/cctalk');

describe('CCTalkParser', () => {
  it('emits data events every 5 bytes', () => {
    const data = Buffer.from('Robots are so freaking cool!');
    const spy = sinon.spy();
    const parser = new CCTalkParser();
    parser.on('data', spy);
    parser.write(data);
    assert.equal(spy.callCount, 3);
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([1, 0, 2]));
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from([254]));
    assert.deepEqual(spy.getCall(2).args[0], Buffer.from([0]));
  });

  it('continues looking for bytes in additional writes', () => {
    const parser = new CCTalkParser();
    const spy = sinon.spy();
    parser.on('data', spy);
    parser.write(Buffer.from([1, 0, 2]));
    parser.write(Buffer.from([254]));
    assert.equal(spy.callCount, 1);
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([1, 0, 2, 254]));
  });
  // TODO: case crc message got data 2 bits
  // TODO: case process remaining buffer
});
