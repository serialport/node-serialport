'use strict';

module.exports = function () {
  var self = this;
  self.paused = false;

  if (self.buffer) {
    var buffer = self.buffer;
    self.buffer = null;
    self._emitData(buffer);
  }

  // No longer open?
  if (null === self.fd) {
    return;
  }

  self._read();
};
