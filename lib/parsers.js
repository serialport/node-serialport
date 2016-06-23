'use strict';

// Copyright 2011 Chris Williams <chris@iterativedesigns.com>

module.exports = {
  raw: function(emitter, buffer) {
    emitter.emit('data', buffer);
  },

  // encoding: ascii utf8 utf16le ucs2 base64 binary hex
  // More: http://nodejs.org/api/buffer.html#buffer_buffer
  readline: function(delimiter, encoding) {
    if (typeof delimiter === 'undefined' || delimiter === null) { delimiter = '\r' }
    if (typeof encoding === 'undefined' || encoding === null) { encoding = 'utf8' }
    // Delimiter buffer saved in closure
    var data = '';
    return function(emitter, buffer) {
      // Collect data
      data += buffer.toString(encoding);
      // Split collected data by delimiter
      var parts = data.split(delimiter);
      data = parts.pop();
      parts.forEach(function(part) {
        emitter.emit('data', part);
      });
    };
  },

  // Emit a data event every `length` bytes
  byteLength: function(length) {
    var data = new Buffer(0);
    return function(emitter, buffer) {
      data = Buffer.concat([data, buffer]);
      while (data.length >= length) {
        var out = data.slice(0, length);
        data = data.slice(length);
        emitter.emit('data', out);
      }
    };
  },

  // Emit a data event each time a byte sequence (delimiter is an array of byte) is found
  // Sample usage : byteDelimiter([10, 13])
  byteDelimiter: function(delimiter) {
    if (Object.prototype.toString.call(delimiter) !== '[object Array]') {
      delimiter = [ delimiter ];
    }
    var buf = [];
    var nextDelimIndex = 0;
    return function(emitter, buffer) {
      for (var i = 0; i < buffer.length; i++) {
        buf[buf.length] = buffer[i];
        if (buf[buf.length - 1] === delimiter[nextDelimIndex]) {
          nextDelimIndex++;
        }
        if (nextDelimIndex === delimiter.length) {
          emitter.emit('data', buf);
          buf = [];
          nextDelimIndex = 0;
        }
      }
    };
  }
};
