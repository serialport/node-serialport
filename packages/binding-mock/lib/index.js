const AbstractBinding = require('@serialport/binding-abstract')
const debug = require('debug')('serialport/binding-mock')
const { wrapWithHiddenComName } = require('./legacy')

let ports = {}
let serialNumber = 0

function resolveNextTick(value) {
  return new Promise(resolve => process.nextTick(() => resolve(value)))
}

/**
 * Mock bindings for pretend serialport access
 */
class MockBinding extends AbstractBinding {
  constructor(opt) {
    super(opt)
    this.pendingRead = null // thunk for a promise or null
    this.isOpen = false
    this.port = null
    this.lastWrite = null
    this.recording = Buffer.alloc(0)
    this.writeOperation = null // in flight promise or null
  }

  // Reset mocks
  static reset() {
    ports = {}
    serialNumber = 0
  }

  // Create a mock port
  static createPort(path, opt) {
    serialNumber++
    opt = {
      echo: false,
      record: false,
      readyData: Buffer.from('READY'),
      manufacturer: 'The J5 Robotics Company',
      vendorId: undefined,
      productId: undefined,
      ...opt,
    }

    ports[path] = {
      data: Buffer.alloc(0),
      echo: opt.echo,
      record: opt.record,
      readyData: Buffer.from(opt.readyData),
      info: {
        path,
        manufacturer: opt.manufacturer,
        serialNumber,
        pnpId: undefined,
        locationId: undefined,
        vendorId: opt.vendorId,
        productId: opt.productId,
      },
    }
    debug(serialNumber, 'created port', JSON.stringify({ path, opt }))
  }

  static async list() {
    return wrapWithHiddenComName(Object.values(ports).map(port => port.info))
  }

  // Emit data on a mock port
  emitData(data) {
    if (!this.isOpen) {
      throw new Error('Port must be open to pretend to receive data')
    }
    if (!Buffer.isBuffer(data)) {
      data = Buffer.from(data)
    }
    debug(this.serialNumber, 'emitting data - pending read:', Boolean(this.pendingRead))
    this.port.data = Buffer.concat([this.port.data, data])
    if (this.pendingRead) {
      process.nextTick(this.pendingRead)
      this.pendingRead = null
    }
  }

  async open(path, opt) {
    debug(null, `opening path ${path}`)
    const port = (this.port = ports[path])
    await super.open(path, opt)
    await resolveNextTick()
    if (!port) {
      throw new Error(`Port does not exist - please call MockBinding.createPort('${path}') first`)
    }
    this.serialNumber = port.info.serialNumber

    if (port.openOpt && port.openOpt.lock) {
      throw new Error('Port is locked cannot open')
    }

    if (this.isOpen) {
      throw new Error('Open: binding is already open')
    }

    port.openOpt = { ...opt }
    this.isOpen = true
    debug(this.serialNumber, 'port is open')
    if (port.echo) {
      process.nextTick(() => {
        if (this.isOpen) {
          debug(this.serialNumber, 'emitting ready data')
          this.emitData(port.readyData)
        }
      })
    }
  }

  async close() {
    const port = this.port
    debug(this.serialNumber, 'closing port')
    if (!port) {
      throw new Error('already closed')
    }

    await super.close()
    delete port.openOpt
    // reset data on close
    port.data = Buffer.alloc(0)
    debug(this.serialNumber, 'port is closed')
    delete this.port
    delete this.serialNumber
    this.isOpen = false
    if (this.pendingRead) {
      this.pendingRead(new Error('port is closed'))
    }
  }

  async read(buffer, offset, length) {
    debug(this.serialNumber, 'reading', length, 'bytes')
    await super.read(buffer, offset, length)
    await resolveNextTick()
    if (!this.isOpen) {
      throw new Error('Read canceled')
    }
    if (this.port.data.length <= 0) {
      return new Promise((resolve, reject) => {
        this.pendingRead = err => {
          if (err) {
            return reject(err)
          }
          this.read(buffer, offset, length).then(resolve, reject)
        }
      })
    }
    const data = this.port.data.slice(0, length)
    const bytesRead = data.copy(buffer, offset)
    this.port.data = this.port.data.slice(length)
    debug(this.serialNumber, 'read', bytesRead, 'bytes')
    return { bytesRead, buffer }
  }

  async write(buffer) {
    debug(this.serialNumber, 'writing')
    if (this.writeOperation) {
      throw new Error('Overlapping writes are not supported and should be queued by the serialport object')
    }
    this.writeOperation = super.write(buffer).then(async () => {
      await resolveNextTick()
      if (!this.isOpen) {
        throw new Error('Write canceled')
      }
      const data = (this.lastWrite = Buffer.from(buffer)) // copy
      if (this.port.record) {
        this.recording = Buffer.concat([this.recording, data])
      }
      if (this.port.echo) {
        process.nextTick(() => {
          if (this.isOpen) {
            this.emitData(data)
          }
        })
      }
      this.writeOperation = null
      debug(this.serialNumber, 'writing finished')
    })
    return this.writeOperation
  }

  async update(opt) {
    await super.update(opt)
    await resolveNextTick()
    this.port.openOpt.baudRate = opt.baudRate
  }

  async set(opt) {
    await super.set(opt)
    await resolveNextTick()
  }

  async get() {
    await super.get()
    await resolveNextTick()
    return {
      cts: true,
      dsr: false,
      dcd: false,
    }
  }

  async getBaudRate() {
    await super.getBaudRate()
    await resolveNextTick()
    return {
      baudRate: this.port.openOpt.baudRate,
    }
  }

  async flush() {
    await super.flush()
    await resolveNextTick()
    this.port.data = Buffer.alloc(0)
  }

  async drain() {
    await super.drain()
    await this.writeOperation
    await resolveNextTick()
  }
}

module.exports = MockBinding
