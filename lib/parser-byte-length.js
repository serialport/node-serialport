'use strict';
var Transform = require('readable-stream').Transform;
var inherits = require('util').inherits;

function ByteLengthParser(options) {
  if (!(this instanceof ByteLengthParser)) {
    return new ByteLengthParser(options);
  }
  Transform.call(this, options);

  options = options || {};

  if (typeof options.length !== 'number') {
    throw new TypeError('"length" is not a number');
  }

  if (options.length < 1) {
    throw new TypeError('"length" is not greater than 0');
  }

  this.length = options.length;
  this.buffer = new Buffer(0);
}

inherits(ByteLengthParser, Transform);

ByteLengthParser.prototype._transform = function(chunk, encoding, cb) {
  var data = Buffer.concat([this.buffer, chunk]);
  while (data.length >= this.length) {
    var out = data.slice(0, this.length);
    this.push(out);
    data = data.slice(this.length);
  }
  this.buffer = data;
  cb();
};

ByteLengthParser.prototype._flush = function(cb) {
  this.push(this.buffer);
  this.buffer = new Buffer(0);
  cb();
};


module.exports = ByteLengthParser;
