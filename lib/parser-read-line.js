'use strict';
var DelimiterParser = require('./parser-delimiter');
var inherits = require('inherits');

function ReadLineParser(options) {
  if (!(this instanceof ReadLineParser)) {
    return new ReadLineParser(options);
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

inherits(ReadLineParser, DelimiterParser);
module.exports = ReadLineParser;
