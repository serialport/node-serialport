'use strict';

const Buffer = require('safe-buffer').Buffer;
const inherits = require('util').inherits;
const Transform = require('stream').Transform;

function RegexParser(options) {
  if (!(this instanceof RegexParser)) {
    return new RegexParser(options);
  }
  Transform.call(this, options);

  options = options || {};

  if (options.delimiter === undefined) {
    throw new TypeError('"delimiter" is not a RegExp object or a string');
  }

  if (options.delimiter.length === 0) {
    throw new TypeError('"delimiter" has a 0 or undefined length');
  }

  if (!(options.delimiter instanceof RegExp)) {
    options.delimiter = new RegExp(options.delimiter);
  }

  const encoding = options.encoding || 'utf8';
  this.setEncoding(encoding);

  this.delimiter = options.delimiter;
  this.buffer = Buffer.alloc(0);
}

inherits(RegexParser, Transform);

RegexParser.prototype._transform = function(chunk, encoding, cb) {
  let data = Buffer.concat([this.buffer, chunk]).toString();

  const parts = data.split(this.delimiter);

  data = parts.pop();

  parts.forEach((part) => {
    this.push(part);
  });

  this.buffer = Buffer.from(data);
  cb();
};

RegexParser.prototype._flush = function(cb) {
  this.push(this.buffer);
  this.buffer = Buffer.alloc(0);
  cb();
};

module.exports = RegexParser;
