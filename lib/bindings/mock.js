'use strict';
const BaseBinding = require('./base');

let ports = {};

class MockBindings extends BaseBinding {
  constructor(opt) {
    super(opt);
    this.onDisconnect = opt.disconnect;
    this.pendingReadCB = null;
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
      readyData: new Buffer('READY')
    }, opt);

    ports[path] = {
      data: new Buffer(0),
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

    if (!this.port.pendingReadCB) {
      return;
    }

    const buffer = this.port.pendingReadCB[0];
    const offset = this.port.pendingReadCB[1];
    const length = this.port.pendingReadCB[2];
    const resolve = this.port.pendingReadCB[3];
    const reject = this.port.pendingReadCB[4];
    this.port.pendingReadCB = null;
    process.nextTick(() => {
      this.read(buffer, offset, length).then(resolve, reject);
    });
  }

  // disconnect a mock port
  disconnect(err) {
    err = err || new Error('Disconnected');
    this.onDisconnect(err);
  }

  open(path, opt) {
    const port = this.port = ports[path];
    return super.open(path, opt)
      .then(() => {
        if (!port) {
          return Promise.reject(new Error(`Port does not exist - please call MockBindings.createPort('${path}') first`));
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
        port.data = new Buffer(0);

        delete this.port;
        this.isOpen = false;
      });
  }

  read(buffer, offset, length) {
    return super.read(buffer, offset, length)
      .then(() => {
        return new Promise((resolve, reject) => {
          if (this.port.data.length <= 0) {
            this.port.pendingReadCB = [buffer, offset, length, resolve, reject];
            return;
          }
          const data = this.port.data.slice(0, length);
          const readLength = data.copy(buffer, offset);
          this.port.data = this.port.data.slice(length);

          resolve(readLength);
        });
      });
  }

  write(buffer) {
    return super.write(buffer)
      .then(() => {
        const data = this.port.lastWrite = new Buffer(buffer); // copy
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
    return super.flush();
      // .then(() => {
      //   if (this.port.pendingReadCB) {
      //     this.port.pendingReadCB = null;
      //   }
      // });
  }

  drain() {
    return super.drain();
  }
}

module.exports = MockBindings;
