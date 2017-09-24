'use strict';
const Transform = require('stream').Transform;

module.exports = class CCTalkParser extends Transform {
  constructor() {
    super();
    this.array = [];
  }
  _transform(buffer, _, cb) {
    // TODO: Better Faster es7 no supported by node 4
    const array = Array.prototype.slice.call(buffer, 0); // [...buffer];
    this.array.push(array);

    // full frame accumulated
    const FullMsgLength = this.array[1] + 5;
    // console.log("FullMsgLength",FullMsgLength);

    while (this.array.length > 1 && this.array.length >= FullMsgLength) {
      // copy command from the array
      const frame = new Uint8Array(FullMsgLength);
      frame.set(this.array.slice(0, FullMsgLength));

      if (this.array.length > FullMsgLength) { // Preserve Extra Data
        this.array = this.array.slice(frame.length, this.array.length);
      } else { // flush the array
        this.array.length = 0;
      }

      this.push(frame);
    }
    cb();
  }
};
