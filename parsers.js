/*jslint node: true */
"use strict";

// Copyright 2011 Chris Williams <chris@iterativedesigns.com>

var parsers = module.exports = {
  raw: function (emitter, buffer) {
    emitter.emit("data", buffer);
  },
  //encoding: ascii utf8 utf16le ucs2 base64 binary hex
  //More: http://nodejs.org/api/buffer.html#buffer_buffer
  readline: function (delimiter, encoding) {
    if (typeof delimiter === "undefined" || delimiter === null) { delimiter = "\r"; }
    if (typeof encoding  === "undefined" || encoding  === null) { encoding  = "utf8"; }
    // Delimiter buffer saved in closure
    var data = "";
    return function (emitter, buffer) {
      // Collect data
      data += buffer.toString(encoding);
      // Split collected data by delimiter
      var parts = data.split(delimiter);
      data = parts.pop();
      parts.forEach(function (part, i, array) {
        emitter.emit('data', part);
      });
    };
  }
};
