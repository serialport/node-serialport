'use strict';

const inherits = require('util').inherits;
const Buffer = require('safe-buffer').Buffer;
const DelimiterParser = require('./delimiter');

function ReadlineParser(options) {
  if (!(this instanceof ReadlineParser)) {
    return new ReadlineParser(options);
  }

  options = options || {};

  if (options.delimiter === undefined) {
    options.delimiter = Buffer.from('\n', 'utf8');
  }

  DelimiterParser.call(this, options);

  const encoding = options.encoding || 'utf8';
  this.delimiter = Buffer.from(options.delimiter, encoding);
  this.setEncoding(encoding);
}

inherits(ReadlineParser, DelimiterParser);
module.exports = ReadlineParser;
