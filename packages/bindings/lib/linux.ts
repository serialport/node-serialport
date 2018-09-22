// tslint:disable:readonly-keyword
import bindings from 'bindings'
import { AbstractBinding, GetFlags, UpdateOptions, OpenOptions, SetFlags, BindingOptions } from '@serialport/binding-abstract'
import debug from 'debug'
import { linuxList } from './linux-list'
import { Poller } from './poller'
import { promisify } from './util'
import { unixRead } from './unix-read'
import { unixWrite } from './unix-write'

const logger = debug('serialport/bindings/LinuxBinding')

const defaultBindingOptions = Object.freeze({
  vmin: 1,
  vtime: 0,
})

export interface LinuxBindingOptions extends BindingOptions {
  vmin?: number
  vtime?: number
}

export interface LinuxOpenOptions extends OpenOptions {
  vmin?: number
  vtime?: number
}

const linuxBindings = bindings('bindings.node')
const closeAsync = promisify(linuxBindings.close) as (fd: number) => Promise<void>
const drainAsync = promisify(linuxBindings.drain) as (fd: number) => Promise<void>
const flushAsync = promisify(linuxBindings.flush) as (fd: number) => Promise<void>
const getAsync = promisify(linuxBindings.get) as (fd: number) => Promise<GetFlags>
const getBaudRateAsync = promisify(linuxBindings.getBaudRate) as (fd: number) => Promise<number>
const openAsync = promisify(linuxBindings.open) as (path: string, opt: LinuxOpenOptions) => Promise<number>
const setAsync = promisify(linuxBindings.set) as (fd: number, opts: SetFlags) => Promise<void>
const updateAsync = promisify(linuxBindings.update) as (fd: number, opts: UpdateOptions) => Promise<void>
/**
 * The linux binding layer
 */
export class LinuxBinding extends AbstractBinding {
  get isOpen() {
    return this.fd !== null
  }

  static list() {
    return linuxList()
  }

  readonly bindingOptions: LinuxBindingOptions
  fd: number
  openOptions: any
  poller: any
  writeOperation: any

  constructor(opt: any) {
    super(opt)
    this.bindingOptions = Object.assign({}, defaultBindingOptions, opt.bindingOptions || {})
    this.fd = null
    this.writeOperation = null
  }

  async close() {
    logger('close')
    if (this.fd === null) {
      throw new Error('Port is not open')
    }
    const fd = this.fd
    this.poller.stop()
    this.poller.destroy()
    this.poller = null
    this.openOptions = null
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

  async open(path: string, options: LinuxOpenOptions) {
    logger('open', path, options)
    if (!path) {
      throw new TypeError('"path" is not a valid port')
    }
    if (typeof options !== 'object') {
      throw new TypeError('"options" is not an object')
    }
    this.openOptions = { ...this.bindingOptions, ...options }
    this.fd = await openAsync(path, this.openOptions)
    this.poller = new Poller(this.fd)
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
    if (!this.fd) {
      throw new Error('Port is not open')
    }

    return unixRead(this, buffer, offset, length)
  }

  async set(options: SetFlags) {
    logger('set', options)
    if (!this.fd) {
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

    if (!this.fd) {
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
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }

    this.writeOperation = unixWrite(this, buffer).then(() => {
      this.writeOperation = null
    })
    return this.writeOperation
  }
}
