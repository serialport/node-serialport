'use strict';
const inherits = require('util').inherits;
const Transform = require('stream').Transform;

function RegexParser(options) {
  if (!(this instanceof RegexParser)) {
    return new RegexParser(options);
  }
  Transform.call(this, options);

  options = options || {};

  if (options.delimiter === undefined) {
    throw new TypeError('"delimiter" is not a RegExp or Bufferable object');
  }

  if (options.delimiter.length === 0) {
    throw new TypeError('"delimiter" has a 0 or undefined length');
  }

  if (!(options.delimiter instanceof RegExp)) {
    options.delimiter = new RegExp(new Buffer(options.delimiter).toString());
  }

  const encoding = options.encoding || 'utf8';
  this.setEncoding(encoding);

  this.delimiter = options.delimiter;
  this.buffer = new Buffer(0);
}

inherits(RegexParser, Transform);

RegexParser.prototype._transform = function(chunk, encoding, cb) {
  let data = Buffer.concat([this.buffer, chunk]).toString();

  const lines = data.split(this.delimiter);

  data = lines.pop();

  lines.forEach((line) => {
    this.push(line);
  });

  this.buffer = new Buffer(data);
  cb();
};

RegexParser.prototype._flush = function(cb) {
  this.push(this.buffer);
  this.buffer = new Buffer(0);
  cb();
};

module.exports = RegexParser;
