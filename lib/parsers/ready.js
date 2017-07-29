'use strict';
const Buffer = require('safe-buffer').Buffer;
const Transform = require('stream').Transform;

module.exports = class ReadyParser extends Transform {
  constructor(options) {
    options = options || {};
    if (options.delimiter === undefined) {
      throw new TypeError('"delimiter" is not a bufferable object');
    }

    if (options.delimiter.length === 0) {
      throw new TypeError('"delimiter" has a 0 or undefined length');
    }

    super(options);
    this.delimiter = Buffer.from(options.delimiter);
    this.readOffset = 0;
    this.ready = false;
  }

  _transform(chunk, encoding, cb) {
    if (this.ready) {
      this.push(chunk);
      return cb();
    }
    const delimiter = this.delimiter;
    let chunkOffset = 0;
    while (this.readOffset < delimiter.length && chunkOffset < chunk.length) {
      if (delimiter[this.readOffset] === chunk[chunkOffset]) {
        this.readOffset++;
      } else {
        this.readOffset = 0;
      }
      chunkOffset++;
    }
    if (this.readOffset === delimiter.length) {
      this.ready = true;
      this.emit('ready');
      const chunkRest = chunk.slice(chunkOffset);
      if (chunkRest.length > 0) {
        this.push(chunkRest);
      }
    }
    cb();
  }
};
