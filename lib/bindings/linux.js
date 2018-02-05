'use strict';
const binding = require('bindings')('serialport.node');
const BaseBinding = require('./base');
const linuxList = require('./linux-list');
const Poller = require('./poller');
const promisify = require('../util').promisify;
const unixRead = require('./unix-read');
const unixWrite = require('./unix-write');

const defaultBindingOptions = Object.freeze({
  vmin: 1,
  vtime: 0
});

class LinuxBinding extends BaseBinding {
  static list() {
    return linuxList();
  }

  constructor(opt) {
    super(opt);
    this.bindingOptions = Object.assign({}, defaultBindingOptions, opt.bindingOptions || {});
    this.fd = null;
    this.writeOperation = null;
  }

  get isOpen() {
    return this.fd !== null;
  }

  open(path, options) {
    return super.open(path, options)
      .then(() => {
        this.openOptions = Object.assign({}, this.bindingOptions, options);
        return promisify(binding.open)(path, this.openOptions);
      })
      .then((fd) => {
        this.fd = fd;
        this.poller = new Poller(fd);
      });
  }

  close() {
    return super.close()
      .then(() => {
        const fd = this.fd;
        this.poller.stop();
        this.poller = null;
        this.openOptions = null;
        this.fd = null;
        return promisify(binding.close)(fd);
      });
  }

  read(buffer, offset, length) {
    return super.read(buffer, offset, length)
      .then(() => unixRead.call(this, buffer, offset, length));
  }

  write(buffer) {
    this.writeOperation = super.write(buffer)
      .then(() => unixWrite.call(this, buffer))
      .then(() => {
        this.writeOperation = null;
      });
    return this.writeOperation;
  }

  update(options) {
    return super.update(options)
      .then(() => promisify(binding.update)(this.fd, options));
  }

  set(options) {
    return super.set(options)
      .then(() => promisify(binding.set)(this.fd, options));
  }

  get() {
    return super.get()
      .then(() => promisify(binding.get)(this.fd));
  }

  getBaudRate() {
    return super.getBaudRate()
      .then(() => promisify(binding.getBaudRate)(this.fd));
  }

  drain() {
    return super.drain()
      .then(() => Promise.resolve(this.writeOperation))
      .then(() => promisify(binding.drain)(this.fd));
  }

  flush() {
    return super.flush()
      .then(() => promisify(binding.flush)(this.fd));
  }
}

module.exports = LinuxBinding;
