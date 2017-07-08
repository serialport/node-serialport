'use strict';
const Buffer = require('safe-buffer').Buffer;
const BaseBinding = require('./base');

let ports = {};

function resolveNextTick() {
  return new Promise(resolve => process.nextTick(resolve));
}

class MockBinding extends BaseBinding {
  constructor(opt) {
    super(opt);
    this.pendingRead = null;
    this.isOpen = false;
  }

  // Reset mocks
  static reset() {
    ports = {};
  }

  // Create a mock port
  static createPort(path, opt) {
    opt = Object.assign({
      echo: true,
      readyData: Buffer.from('READY')
    }, opt);

    ports[path] = {
      data: Buffer.alloc(0),
      lastWrite: null,
      echo: opt.echo,
      readyData: opt.readyData,
      info: {
        comName: path,
        manufacturer: 'The J5 Robotics Company',
        serialNumber: undefined,
        pnpId: undefined,
        locationId: undefined,
        vendorId: undefined,
        productId: undefined
      }
    };
  }

  static list() {
    const info = Object.keys(ports).map((path) => {
      return ports[path].info;
    });
    return Promise.resolve(info);
  }

  // emit data on a mock port
  emitData(data) {
    if (!this.isOpen) {
      return;
    }
    this.port.data = Buffer.concat([this.port.data, data]);

    if (this.port.pendingRead) {
      process.nextTick(this.port.pendingRead);
      this.port.pendingRead = null;
    }
  }

  open(path, opt) {
    const port = this.port = ports[path];
    return super.open(path, opt)
      .then(() => {
        if (!port) {
          return Promise.reject(new Error(`Port does not exist - please call MockBinding.createPort('${path}') first`));
        }

        if (port.openOpt && port.openOpt.lock) {
          return Promise.reject(new Error('Port is locked cannot open'));
        }

        if (this.isOpen) {
          return Promise.reject(new Error('Open: binding is already open'));
        }

        port.openOpt = Object.assign({}, opt);
        this.isOpen = true;
        if (port.echo) {
          process.nextTick(() => this.emitData(port.readyData));
        }
      });
  }

  close() {
    const port = this.port;
    if (!port) {
      return Promise.reject(new Error('close'));
    }

    return super.close()
      .then(() => {
        delete port.openOpt;
        // reset data on close
        port.data = Buffer.alloc(0);

        delete this.port;
        this.isOpen = false;
      });
  }

  read(buffer, offset, length) {
    return super.read(buffer, offset, length)
      .then(resolveNextTick())
      .then(() => {
        if (!this.isOpen) {
          throw new Error('Read canceled');
        }
        if (this.port.data.length <= 0) {
          return new Promise((resolve, reject) => {
            this.port.pendingRead = () => { this.read(buffer, offset, length).then(resolve, reject) };
          });
        }
        const data = this.port.data.slice(0, length);
        const readLength = data.copy(buffer, offset);
        this.port.data = this.port.data.slice(length);

        return readLength;
      });
  }

  write(buffer) {
    return super.write(buffer)
      .then(resolveNextTick())
      .then(() => {
        if (!this.isOpen) {
          throw new Error('Write canceled');
        }
        const data = this.port.lastWrite = Buffer.from(buffer); // copy
        if (this.port.echo) {
          process.nextTick(() => this.emitData(data));
        }
      });
  }

  update(opt) {
    return super.update(opt)
      .then(() => {
        this.port.openOpt.baudRate = opt.baudRate;
      });
  }

  set(opt) {
    return super.set(opt);
  }

  get() {
    return super.get()
      .then(() => {
        return {
          cts: true,
          dsr: false,
          dcd: false
        };
      });
  }

  flush() {
    return super.flush()
      .then(() => {
        this.port.data = Buffer.alloc(0);
      })
      .then(resolveNextTick());
  }

  drain() {
    return super.drain();
  }
}

module.exports = MockBinding;
