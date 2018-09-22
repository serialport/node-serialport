// tslint:disable:readonly-keyword
import bindings from 'bindings'
import debug from 'debug'
import { promisify } from './util'
import { AbstractBinding, PortInfo, GetFlags, UpdateOptions, OpenOptions, SetOptions } from '@serialport/binding-abstract'
import { serialNumParser } from './win32-sn-parser'

const logger = debug('serialport/bindings/WindowsBinding')
const windowsBinding = bindings('bindings.node')
const closeAsync = promisify(windowsBinding.close) as (fd: number) => Promise<void>
const drainAsync = promisify(windowsBinding.drain) as (fd: number) => Promise<void>
const flushAsync = promisify(windowsBinding.flush) as (fd: number) => Promise<void>
const getAsync = promisify(windowsBinding.get) as (fd: number) => Promise<GetFlags>
const getBaudRateAsync = promisify(windowsBinding.getBaudRate) as (fd: number) => Promise<number>
const openAsync = promisify(windowsBinding.open) as (path: string, opt: OpenOptions) => Promise<number>
const setAsync = promisify(windowsBinding.set) as (fd: number, opts: SetOptions) => Promise<void>
const listAsync = promisify(windowsBinding.list) as () => Promise<ReadonlyArray<PortInfo>>
const updateAsync = promisify(windowsBinding.update) as (fd: number, opts: UpdateOptions) => Promise<void>
const readAsync = promisify(windowsBinding.read) as (fd: number, buffer: Buffer, offset: number, length: number) => Promise<number>
const writeAsync = promisify(windowsBinding.write) as (fd: number, buffer: Buffer) => Promise<void>

/**
 * The Windows binding layer
 */
export class WindowsBinding extends AbstractBinding {
  readonly bindingOptions: any
  fd: null | number
  openOptions: any
  writeOperation: null | Promise<void>

  get isOpen() {
    return this.fd !== null
  }
  constructor(opts) {
    super(opts)
    this.fd = null
    this.writeOperation = null
  }

  async close() {
    logger('close')
    if (this.fd === null) {
      throw new Error('Port is not open')
    }
    const fd = this.fd
    this.fd = null
    return closeAsync(fd)
  }

  async drain() {
    logger('drain')
    if (this.fd === null) {
      throw new Error('Port is not open')
    }
    await this.writeOperation
    return drainAsync(this.fd)
  }

  async flush() {
    logger('flush')
    if (this.fd === null) {
      throw new Error('Port is not open')
    }

    return flushAsync(this.fd)
  }

  async get() {
    logger('get')
    if (this.fd === null) {
      throw new Error('Port is not open')
    }
    return getAsync(this.fd)
  }

  async getBaudRate() {
    logger('getBaudRate')
    if (this.fd === null) {
      throw new Error('Port is not open')
    }
    return getBaudRateAsync(this.fd)
  }

  async open(path: string, options: OpenOptions) {
    logger('open', path, options)
    if (!path) {
      throw new TypeError('"path" is not a valid port')
    }
    if (typeof options !== 'object') {
      throw new TypeError('"options" is not an object')
    }
    this.openOptions = { ...options }
    this.fd = await openAsync(path, this.openOptions)
  }

  async read(buffer: Buffer, offset: number, length: number): Promise<number> {
    logger('read', offset, length)
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('"buffer" is not a Buffer')
    }
    if (typeof offset !== 'number') {
      throw new TypeError('"offset" is not an integer')
    }
    if (typeof length !== 'number') {
      throw new TypeError('"length" is not an integer')
    }
    if (buffer.length < offset + length) {
      throw new Error('"buffer" length is smaller than the "offset" + "length"')
    }
    if (this.fd === null) {
      throw new Error('Port is not open')
    }

    try {
      return readAsync(this.fd, buffer, offset, length)
    } catch (error) {
      if (this.fd === null) {
        ;(error as any).canceled = true
      }
      throw error
    }
  }

  async set(options: SetOptions) {
    logger('set', options)
    if (this.fd === null) {
      throw new Error('Port is not open')
    }
    return setAsync(this.fd, options)
  }

  async update(options: UpdateOptions) {
    logger('update', options)
    if (typeof options !== 'object') {
      throw TypeError('"options" is not an object')
    }

    if (typeof options.baudRate !== 'number') {
      throw new TypeError('"options.baudRate" is not a number')
    }

    if (this.fd === null) {
      throw new Error('Port is not open')
    }

    return updateAsync(this.fd, options)
  }

  async write(buffer: Buffer) {
    if (!Buffer.isBuffer(buffer)) {
      logger('write')
      throw new TypeError('"buffer" is not a Buffer')
    }
    logger('write', buffer.length, 'bytes')
    if (this.fd === null) {
      throw new Error('Port is not open')
    }

    this.writeOperation = writeAsync(this.fd, buffer).then(() => {
      this.writeOperation = null
    })
    return this.writeOperation
  }

  static async list() {
    const ports = await listAsync()
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
}
