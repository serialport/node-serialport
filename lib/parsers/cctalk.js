'use strict';
const Transform = require('stream').Transform;

module.exports = class CCTalkParser extends Transform {
  constructor() {
    super();
    this.array = [];
    this.cursor = 0;
  }
  _transform(buffer, _, cb) {
    this.cursor += buffer.length;
    // TODO: Better Faster es7 no supported by node 4
    const array = Array.prototype.slice.call(buffer, 0); // [...buffer];
    array.map((byte) => this.array.push(byte)); // ES7 allows directly push

    // full frame accumulated
    while (this.cursor > 1 && this.cursor >= this.array[1] + 5) {
      // copy command from the array
      const FullMsgLength = this.array[1] + 5;
      const frame = new Uint8Array(FullMsgLength);
      frame.set(this.array.slice(0, FullMsgLength));

      // Preserve Extra Data
      this.array = this.array.slice(frame.length, this.array.length);
      this.cursor -= FullMsgLength;
      this.push(frame);
    }
    cb();
  }
};
