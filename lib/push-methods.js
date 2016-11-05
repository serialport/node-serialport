'use strict';

function allocNewPool(poolSize) {
  var pool;
  // performs better on node 6+
  if (Buffer.allocUnsafe) {
    pool = Buffer.allocUnsafe(poolSize);
  } else {
    pool = new Buffer(poolSize);
  }
  pool.used = 0;
  return pool;
}

function _read(bytesToRead) {
  if (!this._pool || this._pool.length - this._pool.used < this._kMinPoolSpace) {
    // discard the old this._pool.
    this._pool = allocNewPool(this._readBufferSize);
  }

  // Grab another reference to the pool in the case that while we're
  // in the thread pool another read() finishes up the pool, and
  // allocates a new one.
  var pool = this._pool;
  // Read the smaller of rest of the pool or however many bytes we want
  var toRead = Math.min(pool.length - pool.used, bytesToRead);
  var start = pool.used;

  // the actual read.
  var self = this;
  this.read(pool, start, toRead, function onRead(err, bytesRead) {
    if (err) {
      return this.disconnect(err);
    }
    pool.used += bytesRead;
    self.push(pool.slice(start, start + bytesRead));
  });
};

function pushBindingWrap(opt) {
  if (typeof opt.binding !== 'object') {
    throw new TypeError('"binding" is not an object');
  }
  if (typeof opt.push !== 'function') {
    throw new TypeError('"push" is not a function');
  }

  var binding = opt.binding;
  if (typeof binding._read !== 'function') {
    binding._read = _read;
    binding._readBufferSize = opt.readBufferSize || 1024;
    binding._kMinPoolSpace = opt.kMinPoolSpace || 128;
    binding._pool = null;
  }
  if (typeof binding.push !== 'function') {
    binding.push = opt.push;
  }
  return binding;
};


module.exports = pushBindingWrap;
