'use strict';
const debug = require('debug')('serialport:bindings:mock');
const Buffer = require('safe-buffer').Buffer;
const BaseBinding = require('./base');

let ports = {};
let serialNumber = 0;

function resolveNextTick(value) {
  return new Promise(resolve => process.nextTick(() => resolve(value)));
}

class MockBinding extends BaseBinding {
  constructor(opt) {
    super(opt);
    this.pendingRead = null; // thunk for a promise or null
    this.isOpen = false;
    this.port = null;
    this.lastWrite = null;
    this.recording = new Buffer(0);
    this.writeOperation = null; // in flight promise or null
  }

  // Reset mocks
  static reset() {
    ports = {};
  }

  // Create a mock port
  static createPort(path, opt) {
    serialNumber++;
    opt = Object.assign({
      echo: false,
      record: false,
      readyData: Buffer.from('READY')
    }, opt);

    ports[path] = {
      data: Buffer.alloc(0),
      echo: opt.echo,
      record: opt.record,
      readyData: Buffer.from(opt.readyData),
      info: {
        comName: path,
        manufacturer: 'The J5 Robotics Company',
        serialNumber,
        pnpId: undefined,
        locationId: undefined,
        vendorId: undefined,
        productId: undefined
      }
    };
    debug(serialNumber, 'created port', JSON.stringify({ path, opt }));
  }

  static list() {
    const info = Object.keys(ports).map((path) => {
      return ports[path].info;
    });
    return Promise.resolve(info);
  }

  // Emit data on a mock port
  emitData(data) {
    if (!this.isOpen) {
      throw new Error('Port must be open to pretend to receive data');
    }
    if (!Buffer.isBuffer(data)) {
      data = Buffer.from(data);
    }
    debug(this.serialNumber, 'emitting data - pending read:', Boolean(this.pendingRead));
    this.port.data = Buffer.concat([this.port.data, data]);
    if (this.pendingRead) {
      process.nextTick(this.pendingRead);
      this.pendingRead = null;
    }
  }

  open(path, opt) {
    debug(null, `opening path ${path}`);
    const port = this.port = ports[path];
    return super.open(path, opt)
      .then(resolveNextTick)
      .then(() => {
        if (!port) {
          return Promise.reject(new Error(`Port does not exist - please call MockBinding.createPort('${path}') first`));
        }
        this.serialNumber = port.info.serialNumber;

        if (port.openOpt && port.openOpt.lock) {
          return Promise.reject(new Error('Port is locked cannot open'));
        }

        if (this.isOpen) {
          return Promise.reject(new Error('Open: binding is already open'));
        }

        port.openOpt = Object.assign({}, opt);
        this.isOpen = true;
        debug(this.serialNumber, 'port is open');
        if (port.echo) {
          process.nextTick(() => {
            if (this.isOpen) {
              debug(this.serialNumber, 'emitting ready data');
              this.emitData(port.readyData);
            }
          });
        }
      });
  }

  close() {
    const port = this.port;
    debug(this.serialNumber, 'closing port');
    if (!port) {
      return Promise.reject(new Error('already closed'));
    }

    return super.close()
      .then(() => {
        delete port.openOpt;
        // reset data on close
        port.data = Buffer.alloc(0);
        debug(this.serialNumber, 'port is closed');
        delete this.port;
        delete this.serialNumber;
        this.isOpen = false;
        if (this.pendingRead) {
          this.pendingRead(new Error('port is closed'));
        }
      });
  }

  read(buffer, offset, length) {
    debug(this.serialNumber, 'reading', length, 'bytes');
    return super.read(buffer, offset, length)
      .then(resolveNextTick)
      .then(() => {
        if (!this.isOpen) {
          throw new Error('Read canceled');
        }
        if (this.port.data.length <= 0) {
          return new Promise((resolve, reject) => {
            this.pendingRead = (err) => {
              if (err) { return reject(err) }
              this.read(buffer, offset, length).then(resolve, reject);
            };
          });
        }
        const data = this.port.data.slice(0, length);
        const readLength = data.copy(buffer, offset);
        this.port.data = this.port.data.slice(length);
        debug(this.serialNumber, 'read', readLength, 'bytes');
        return readLength;
      });
  }

  write(buffer) {
    debug(this.serialNumber, 'writing');
    if (this.writeOperation) {
      throw new Error('Overlapping writes are not supported and should be queued by the serialport object');
    }
    this.writeOperation = super.write(buffer)
      .then(resolveNextTick)
      .then(() => {
        if (!this.isOpen) {
          throw new Error('Write canceled');
        }
        const data = this.lastWrite = Buffer.from(buffer); // copy
        if (this.port.record) {
          this.recording = Buffer.concat([this.recording, data]);
        }
        if (this.port.echo) {
          process.nextTick(() => {
            if (this.isOpen) { this.emitData(data) }
          });
        }
        this.writeOperation = null;
        debug(this.serialNumber, 'writing finished');
      });
    return this.writeOperation;
  }

  update(opt) {
    return super.update(opt)
      .then(resolveNextTick)
      .then(() => {
        this.port.openOpt.baudRate = opt.baudRate;
      });
  }

  set(opt) {
    return super.set(opt)
      .then(resolveNextTick);
  }

  get() {
    return super.get()
      .then(resolveNextTick)
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
      .then(resolveNextTick)
      .then(() => {
        this.port.data = Buffer.alloc(0);
      });
  }

  drain() {
    return super.drain()
      .then(() => this.writeOperation)
      .then(() => resolveNextTick());
  }
}

module.exports = MockBinding;
