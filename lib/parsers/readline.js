'use strict';
const DelimiterParser = require('./delimiter');
const inherits = require('util').inherits;

function ReadlineParser(options) {
  if (!(this instanceof ReadlineParser)) {
    return new ReadlineParser(options);
  }

  options = options || {};

  if (options.delimiter === undefined) {
    options.delimiter = new Buffer('\n', 'utf8');
  }

  DelimiterParser.call(this, options);

  const encoding = options.encoding || 'utf8';
  this.delimiter = new Buffer(options.delimiter, encoding);
  this.setEncoding(encoding);
}

inherits(ReadlineParser, DelimiterParser);
module.exports = ReadlineParser;
