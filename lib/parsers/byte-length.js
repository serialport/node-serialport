'use strict';
const Buffer = require('safe-buffer').Buffer;
const Transform = require('stream').Transform;

module.exports = class ByteLengthParser extends Transform {
  constructor(options) {
    super(options);
    options = options || {};

    if (typeof options.length !== 'number') {
      throw new TypeError('"length" is not a number');
    }

    if (options.length < 1) {
      throw new TypeError('"length" is not greater than 0');
    }

    this.length = options.length;
    this.buffer = Buffer.alloc(0);
  }

  _transform(chunk, encoding, cb) {
    let data = Buffer.concat([this.buffer, chunk]);
    while (data.length >= this.length) {
      const out = data.slice(0, this.length);
      this.push(out);
      data = data.slice(this.length);
    }
    this.buffer = data;
    cb();
  }

  _flush(cb) {
    this.push(this.buffer);
    this.buffer = Buffer.alloc(0);
    cb();
  }
};
