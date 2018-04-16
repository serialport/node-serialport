'use strict';
const binding = require('bindings')('serialport.node');
const BaseBinding = require('./base');
const promisify = require('../util').promisify;
const serialNumParser = require('./win32-sn-parser');

/**
 * The Windows binding layer
 */
class WindowsBinding extends BaseBinding {
  static list() {
    return promisify(binding.list)().then(ports => {
      // Grab the serial number from the pnp id
      ports.forEach(port => {
        if (port.pnpId && !port.serialNumber) {
          const serialNumber = serialNumParser(port.pnpId);
          if (serialNumber) {
            port.serialNumber = serialNumber;
          }
        }
      });
      return ports;
    });
  }

  constructor(opt) {
    super(opt);
    this.bindingOptions = Object.assign({}, opt.bindingOptions || {});
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
      });
  }

  close() {
    return super.close()
      .then(() => {
        const fd = this.fd;
        this.fd = null;
        return promisify(binding.close)(fd);
      });
  }

  read(buffer, offset, length) {
    return super.read(buffer, offset, length)
      .then(() => promisify(binding.read)(this.fd, buffer, offset, length))
      .catch(err => {
        if (!this.isOpen) {
          err.canceled = true;
        }
        throw err;
      });
  }

  write(buffer) {
    this.writeOperation = super.write(buffer)
      .then(() => promisify(binding.write)(this.fd, buffer))
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
    return super.get()
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

module.exports = WindowsBinding;
