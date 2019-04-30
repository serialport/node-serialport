const binding = require('bindings')('bindings.node')
const AbstractBinding = require('@serialport/binding-abstract')
const { promisify } = require('util')
const serialNumParser = require('./win32-sn-parser')

const asyncList = promisify(binding.list)
const asyncOpen = promisify(binding.open)
const asyncRead = promisify(binding.read)
const asyncWrite = promisify(binding.write)
const asyncUpdate = promisify(binding.update)
const asyncSet = promisify(binding.set)
const asyncGet = promisify(binding.get)
const asyncGetBaudRate = promisify(binding.getBaudRate)
const asyncDrain = promisify(binding.drain)
const asyncFlush = promisify(binding.flush)

/**
 * The Windows binding layer
 */
class WindowsBinding extends AbstractBinding {
  static async list() {
    const ports = await asyncList()
    // Grab the serial number from the pnp id
    return ports.map(port => {
      if (port.pnpId && !port.serialNumber) {
        const serialNumber = serialNumParser(port.pnpId)
        if (serialNumber) {
          return {
            ...port,
            serialNumber,
          }
        }
      }
      return port
    })
  }

  constructor(opt) {
    super(opt)
    this.bindingOptions = { ...opt.bindingOptions }
    this.fd = null
    this.writeOperation = null
  }

  get isOpen() {
    return this.fd !== null
  }

  async open(path, options) {
    await super.open(path, options)
    this.openOptions = { ...this.bindingOptions, ...options }
    const fd = await asyncOpen(path, this.openOptions)
    this.fd = fd
  }

  async close() {
    await super.close()
    const fd = this.fd
    this.fd = null
    return asyncClose(fd)
  }

  async read(buffer, offset, length) {
    await super.read(buffer, offset, length)
    return asyncRead(this.fd, buffer, offset, length).catch(err => {
      if (!this.isOpen) {
        err.canceled = true
      }
      throw err
    })
  }

  async write(buffer) {
    if (buffer.length === 0) {
      return
    }
    this.writeOperation = super
      .write(buffer)
      .then(() => asyncWrite(this.fd, buffer))
      .then(() => {
        this.writeOperation = null
      })
    return this.writeOperation
  }

  async update(options) {
    await super.update(options)
    return asyncUpdate(this.fd, options)
  }

  async set(options) {
    await super.set(options)
    return asyncSet(this.fd, options)
  }

  async get() {
    await super.get()
    return asyncGet(this.fd)
  }

  async getBaudRate() {
    await super.get()
    return asyncGetBaudRate(this.fd)
  }

  async drain() {
    await super.drain()
    await this.writeOperation
    return asyncDrain(this.fd)
  }

  async flush() {
    await super.flush()
    return asyncFlush(this.fd)
  }
}

module.exports = WindowsBinding
