'use strict';
const Buffer = require('safe-buffer').Buffer;
const DelimiterParser = require('./delimiter');

module.exports = class ReadLineParser extends DelimiterParser {
  constructor(options) {
    const opts = Object.assign({
      delimiter: Buffer.from('\n', 'utf8'),
      encoding: 'utf8'
    }, options);

    if (typeof opts.delimiter === 'string') {
      opts.delimiter = Buffer.from(opts.delimiter, opts.encoding);
    }

    super(opts);
  }
};
