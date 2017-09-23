'use strict';
const Buffer = require('safe-buffer').Buffer;
const Transform = require('stream').Transform;

const MAX_PACKET_LENGTH = 255 + 5;

module.exports = class ccTalkParser extends Transform {
  constructor() {
    super();
    this.buffer = Buffer.alloc(MAX_PACKET_LENGTH); // maxium ccTalkMessage length
    this.cursor = 0;
  }
  _transform(buffer, _, cb) {
    this.buffer.set(buffer, this.cursor);
    this.cursor += buffer.length;
    // full frame accumulated
    const length = this.buffer[1] + 5;
    // console.log("length", length);

    while (this.cursor > 1 && this.cursor >= length) {
      // copy command from the buffer
      const frame = new Uint8Array(length);
      frame.set(this.buffer.slice(0, length));

      // copy remaining buffer to the begin of the buffer to prepare for next command
      this.buffer.set(this.buffer.slice(length, this.cursor));
      this.cursor -= length;
      this.push(frame);
    }
    cb();
  }
};
