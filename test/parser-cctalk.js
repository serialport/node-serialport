'use strict';
/* eslint-disable no-new */

const Buffer = require('safe-buffer').Buffer;
const sinon = require('sinon');
const CCTalkParser = require('../lib/parsers/cctalk');

describe('CCTalkParser', () => {
  it('continues looking for bytes in additional writes', () => {
    const parser = new CCTalkParser();
    const spy = sinon.spy();
    // parser.on('data', spy);
    // parser.write(Buffer.from([1, 0, 2]));
    // parser.write(Buffer.from([254, 217]));
  });
  // TODO: case crc message got data 2 bits
  // TODO: case process remaining buffer
});
