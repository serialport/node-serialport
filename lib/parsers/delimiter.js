'use strict';
const Buffer = require('safe-buffer').Buffer;
const Transform = require('stream').Transform;

module.exports = class DelimiterParser extends Transform {
  constructor(options) {
    options = options || {};
    super(options);

    if (options.delimiter === undefined) {
      throw new TypeError('"delimiter" is not a bufferable object');
    }

    if (options.delimiter.length === 0) {
      throw new TypeError('"delimiter" has a 0 or undefined length');
    }

    this.delimiter = Buffer.from(options.delimiter);
    this.buffer = Buffer.alloc(0);
  }

  _transform(chunk, encoding, cb) {
    let data = Buffer.concat([this.buffer, chunk]);
    let position;
    while ((position = data.indexOf(this.delimiter)) !== -1) {
      this.push(data.slice(0, position));
      data = data.slice(position + this.delimiter.length);
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
