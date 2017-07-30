'use strict';
const Transform = require('stream').Transform;

module.exports = class RegexParser extends Transform {
  constructor(options) {
    const opts = Object.assign({
      encoding: 'utf8'
    }, options);

    if (opts.regex === undefined) {
      throw new TypeError('"options.regex" must be a regular expression pattern or object');
    }

    if (!(opts.regex instanceof RegExp)) {
      opts.regex = new RegExp(opts.regex);
    }
    super(opts);

    this.regex = opts.regex;
    this.buffer = '';
  }

  _transform(chunk, encoding, cb) {
    const data = this.buffer + chunk;
    const parts = data.split(this.regex);
    this.buffer = parts.pop();

    parts.forEach((part) => {
      this.push(part);
    });
    cb();
  }

  _flush(cb) {
    this.push(this.buffer);
    this.buffer = '';
    cb();
  }
};
