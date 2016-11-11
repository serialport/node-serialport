'use strict';
var DelimiterParser = require('./parser-delimiter');
var inherits = require('util').inherits;

function ReadlineParser(options) {
  if (!(this instanceof ReadlineParser)) {
    return new ReadlineParser(options);
  }

  options = options || {};

  if (options.delimiter === undefined) {
    options.delimiter = new Buffer('\n', 'utf8');
  }

  DelimiterParser.call(this, options);

  var encoding = options.encoding || 'utf8';
  this.delimiter = new Buffer(options.delimiter, encoding);
  this.setEncoding(encoding);
}

inherits(ReadlineParser, DelimiterParser);
module.exports = ReadlineParser;
