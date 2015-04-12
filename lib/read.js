'use strict';
var fs = require('fs');

// Stuff from ReadStream, refactored for our usage:
var kPoolSize = 40 * 1024;
var kMinPoolSpace = 128;

module.exports = function () {
  var self = this;

  // console.log(">>READ");
  if (!self.readable || self.paused || self.reading) {
    return;
  }

  self.reading = true;

  if (!self.pool || self.pool.length - self.pool.used < kMinPoolSpace) {
    // discard the old pool. Can't add to the free list because
    // users might have refernces to slices on it.
    self.pool = null;

    // alloc new pool
    self.pool = new Buffer(kPoolSize);
    self.pool.used = 0;
  }

  // Grab another reference to the pool in the case that while we're in the
  // thread pool another read() finishes up the pool, and allocates a new
  // one.
  var toRead = Math.min(self.pool.length - self.pool.used, ~~self.bufferSize);
  var start = self.pool.used;

  function afterRead(err, bytesRead, readPool, bytesRequested) {
    self.reading = false;
    if (err) {
      if (err.code && err.code === 'EAGAIN') {
        if (self.fd >= 0) {
          self.serialPoller.start();
        }
      } else if (err.code && (err.code === 'EBADF' || err.code === 'ENXIO' || (err.errno === -1 || err.code === 'UNKNOWN'))) { // handle edge case were mac/unix doesn't clearly know the error.
        self.disconnected(err);
      } else {
        self.fd = null;
        self.emit('error', err);
        self.readable = false;
      }
    } else {
      // Since we will often not read the number of bytes requested,
      // let's mark the ones we didn't need as available again.
      self.pool.used -= bytesRequested - bytesRead;

      if (bytesRead === 0) {
        if (self.fd >= 0) {
          self.serialPoller.start();
        }
      } else {
        var b = self.pool.slice(start, start + bytesRead);

        // do not emit events if the stream is paused
        if (self.paused) {
          self.buffer = Buffer.concat([self.buffer, b]);
          return;
        } else {
          self._emitData(b);
        }

        // do not emit events anymore after we declared the stream unreadable
        if (!self.readable) {
          return;
        }
        self._read();
      }
    }

  }

  fs.read(self.fd, self.pool, self.pool.used, toRead, null, function (err, bytesRead) {
    var readPool = self.pool;
    var bytesRequested = toRead;
    afterRead(err, bytesRead, readPool, bytesRequested);
  });

  self.pool.used += toRead;
};
