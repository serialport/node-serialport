'use strict';
const Buffer = require('safe-buffer').Buffer;
const Transform = require('stream').Transform;

const MAX_PACKET_LENGTH = 255 + 5;
const debug = require('debug');

module.exports = class ccTalkParser extends Transform {
  constructor() {
    super();
    this.buffer = Buffer.alloc(MAX_PACKET_LENGTH); // maxium ccTalkMessage length
    this.cursor = 0;
  }
  _transform(buffer, _, cb) {
    debug('parser set')(this.buffer, buffer, this.cursor);
    debug('parser set')(this.buffer.toString('hex'), buffer.buffer, this.cursor);

    this.buffer.set(buffer, this.cursor);
    this.cursor += buffer.length;
    debug('parse befor loop')(buffer, this.cursor);
    while (this.cursor > 1 && this.cursor >= this.buffer[1] + 5) {
      // full frame accumulated
      const length = this.buffer[1] + 5;
      // console.log("length", length);

      // copy command from the buffer
      const frame = new Uint8Array(length);
      frame.set(this.buffer.slice(0, length));

      // copy remaining buffer to the begin of the buffer to prepare for next command
      this.buffer.set(this.buffer.slice(length, this.cursor));
      this.cursor -= length;
      debug('parse push', frame, this.buffer, this.cursor);
      this.push(frame);
    }
    cb();
  }
};
