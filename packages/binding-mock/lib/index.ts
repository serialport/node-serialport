import debugFactory from 'debug'
import { BindingInterface, PortStatus, SetOptions, UpdateOptions, OpenOptions, PortInfo } from '@serialport/bindings-cpp'
const debug = debugFactory('serialport/bindings-mock')

interface MockPortInternal {
  data: Buffer
  echo: boolean
  record: boolean
  readyData: Buffer
  info: PortInfo
  openOpt?: OpenOptions
}

interface CreatePortOptions {
  echo?: boolean
  record?: boolean
  readyData?: Buffer
  manufacturer?: string
  vendorId?: string
  productId?: string
}

let ports: {
  [key: string]: MockPortInternal
} = {}
let serialNumber = 0

function resolveNextTick() {
  return new Promise<void>(resolve => process.nextTick(() => resolve()))
}

export class CanceledError extends Error {
  canceled: true
  constructor(message: string) {
    super(message)
    this.canceled = true
  }
}

/**
 * Mock bindings for pretend serialport access
 */
export class MockBinding extends BindingInterface {
  pendingRead: null | ((err: null | Error) => void)
  port: null | MockPortInternal
  lastWrite: null | Buffer
  recording: Buffer
  writeOperation: null | Promise<void>
  isOpen: boolean
  serialNumber?: string

  constructor() {
    super()
    this.pendingRead = null
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
  static createPort(path: string, opt: CreatePortOptions = {}) {
    serialNumber++
    const optWithDefaults = {
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
      echo: optWithDefaults.echo,
      record: optWithDefaults.record,
      readyData: Buffer.from(optWithDefaults.readyData),
      info: {
        path,
        manufacturer: opt.manufacturer,
        serialNumber: `${serialNumber}`,
        pnpId: undefined,
        locationId: undefined,
        vendorId: opt.vendorId,
        productId: opt.productId,
      },
    }
    debug(serialNumber, 'created port', JSON.stringify({ path, opt }))
  }

  static async list() {
    return Object.values(ports).map(port => port.info)
  }

  // Emit data on a mock port
  emitData(data: Buffer | string) {
    if (!this.isOpen || !this.port) {
      throw new Error('Port must be open to pretend to receive data')
    }
    const bufferData = Buffer.isBuffer(data) ? data : Buffer.from(data)
    debug(this.serialNumber, 'emitting data - pending read:', Boolean(this.pendingRead))
    this.port.data = Buffer.concat([this.port.data, bufferData])
    if (this.pendingRead) {
      process.nextTick(this.pendingRead)
      this.pendingRead = null
    }
  }

  async open(path: string, options?: OpenOptions) {
    if (!path) {
      throw new TypeError('"path" is not a valid port')
    }

    if (typeof options !== 'object') {
      throw new TypeError('"options" is not an object')
    }
    debug(null, `opening path ${path}`)

    if (this.isOpen) {
      throw new Error('Already open')
    }

    const port = (this.port = ports[path])
    await resolveNextTick()
    if (!port) {
      throw new Error(`Port does not exist - please call MockBinding.createPort('${path}') first`)
    }
    this.serialNumber = port.info.serialNumber

    if (port.openOpt?.lock) {
      throw new Error('Port is locked cannot open')
    }

    if (this.isOpen) {
      throw new Error('Open: binding is already open')
    }

    port.openOpt = { ...options }
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

  async close(): Promise<void> {
    debug(this.serialNumber, 'close')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }

    const port = this.port
    if (!port) {
      throw new Error('already closed')
    }

    delete port.openOpt
    // reset data on close
    port.data = Buffer.alloc(0)
    debug(this.serialNumber, 'port is closed')
    this.port = null
    delete this.serialNumber
    this.isOpen = false
    if (this.pendingRead) {
      this.pendingRead(new CanceledError('port is closed'))
    }
  }

  async read(
    buffer: Buffer,
    offset: number,
    length: number
  ): Promise<{
    buffer: Buffer
    bytesRead: number
  }> {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('"buffer" is not a Buffer')
    }

    if (typeof offset !== 'number' || isNaN(offset)) {
      throw new TypeError(`"offset" is not an integer got "${isNaN(offset) ? 'NaN' : typeof offset}"`)
    }

    if (typeof length !== 'number' || isNaN(length)) {
      throw new TypeError(`"length" is not an integer got "${isNaN(length) ? 'NaN' : typeof length}"`)
    }

    if (buffer.length < offset + length) {
      throw new Error('buffer is too small')
    }

    if (!this.isOpen) {
      throw new Error('Port is not open')
    }

    debug(this.serialNumber, 'read', length, 'bytes')
    await resolveNextTick()
    if (!this.isOpen || !this.port) {
      throw new CanceledError('Read canceled')
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

  async write(buffer: Buffer): Promise<void> {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('"buffer" is not a Buffer')
    }

    if (!this.isOpen || !this.port) {
      debug('write', 'error port is not open')
      throw new Error('Port is not open')
    }

    debug(this.serialNumber, 'write', buffer.length, 'bytes')
    if (this.writeOperation) {
      throw new Error('Overlapping writes are not supported and should be queued by the serialport object')
    }
    this.writeOperation = (async () => {
      await resolveNextTick()
      if (!this.isOpen || !this.port) {
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
    })()
    return this.writeOperation
  }

  async update(options: UpdateOptions): Promise<void> {
    if (typeof options !== 'object') {
      throw TypeError('"options" is not an object')
    }

    if (typeof options.baudRate !== 'number') {
      throw new TypeError('"options.baudRate" is not a number')
    }

    debug(this.serialNumber, 'update')
    if (!this.isOpen || !this.port) {
      throw new Error('Port is not open')
    }
    await resolveNextTick()
    if (this.port.openOpt) {
      this.port.openOpt.baudRate = options.baudRate
    }
  }

  async set(options: SetOptions): Promise<void> {
    if (typeof options !== 'object') {
      throw new TypeError('"options" is not an object')
    }
    debug(this.serialNumber, 'set')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
    await resolveNextTick()
  }

  async get(): Promise<PortStatus> {
    debug(this.serialNumber, 'get')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
    await resolveNextTick()
    return {
      cts: true,
      dsr: false,
      dcd: false,
    }
  }

  async getBaudRate(): Promise<{ baudRate: number }> {
    debug(this.serialNumber, 'getBaudRate')
    if (!this.isOpen || !this.port) {
      throw new Error('Port is not open')
    }
    await resolveNextTick()
    if (!this.port.openOpt?.baudRate) {
      throw new Error('Internal Error')
    }
    return {
      baudRate: this.port.openOpt.baudRate,
    }
  }

  async flush(): Promise<void> {
    debug(this.serialNumber, 'flush')
    if (!this.isOpen || !this.port) {
      throw new Error('Port is not open')
    }
    await resolveNextTick()
    this.port.data = Buffer.alloc(0)
  }

  async drain(): Promise<void> {
    debug(this.serialNumber, 'drain')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
    await this.writeOperation
    await resolveNextTick()
  }
}
