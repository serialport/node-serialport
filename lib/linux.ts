import debugFactory from 'debug'
import { linuxList } from './linux-list'
import { Poller } from './poller'
import { unixRead } from './unix-read'
import { unixWrite } from './unix-write'
import { BindingInterface, OpenOptions, PortStatus, SetOptions, UpdateOptions } from './binding-interface'
import { asyncOpen, asyncClose, asyncUpdate, asyncSet, asyncGet, asyncGetBaudRate, asyncFlush, asyncDrain } from './load-bindings'

const debug = debugFactory('serialport/bindings-cpp')

export interface LinuxBindingOptions {
  /** see [`man termios`](http://linux.die.net/man/3/termios) defaults to 1 */
  vmin?: number
  /** see [`man termios`](http://linux.die.net/man/3/termios) defaults to 0 */
  vtime?: number
  // * @param {Boolean} [options.lowLatency=false] flag for lowLatency mode on Linux
}

export interface LinuxPortStatus extends PortStatus {
  lowLatency: boolean
}

export interface LinuxSetOptions extends SetOptions {
  /** Low latency mode */
  lowLatency?: boolean
}

/**
 * The linux binding layer
 */
export class LinuxBinding extends BindingInterface {
  bindingOptions: LinuxBindingOptions
  fd: null | number
  writeOperation: Promise<void> | null
  openOptions: (LinuxBindingOptions & OpenOptions) | null
  poller: Poller | null

  static list() {
    debug('list')
    return linuxList()
  }

  constructor(opt?: LinuxBindingOptions) {
    super()
    this.bindingOptions = {
      vmin: 1,
      vtime: 0,
      ...opt,
    }
    this.fd = null
    this.writeOperation = null
  }

  get isOpen() {
    return this.fd !== null
  }

  async open(path: string, options?: OpenOptions) {
    if (!path) {
      throw new TypeError('"path" is not a valid port')
    }

    if (typeof options !== 'object') {
      throw new TypeError('"options" is not an object')
    }
    debug('open')

    if (this.isOpen) {
      throw new Error('Already open')
    }
    this.openOptions = { ...this.bindingOptions, ...options }
    const fd: number = await asyncOpen(path, this.openOptions)
    this.fd = fd
    this.poller = new Poller(fd)
  }

  async close(): Promise<void> {
    debug('close')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }

    const fd = this.fd
    this.poller?.stop()
    this.poller?.destroy()
    this.poller = null
    this.openOptions = null
    this.fd = null
    await asyncClose(fd)
  }

  async read(
    buffer: Buffer,
    offset: number,
    length: number,
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

    debug('read')
    if (buffer.length < offset + length) {
      throw new Error('buffer is too small')
    }

    if (!this.isOpen) {
      throw new Error('Port is not open')
    }

    return unixRead({ binding: this, buffer, offset, length })
  }

  async write(buffer: Buffer): Promise<void> {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('"buffer" is not a Buffer')
    }

    debug('write', buffer.length, 'bytes')
    if (!this.isOpen) {
      debug('write', 'error port is not open')

      throw new Error('Port is not open')
    }

    this.writeOperation = (async () => {
      if (buffer.length === 0) {
        return
      }
      await unixWrite({ binding: this, buffer })
      this.writeOperation = null
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

    debug('update')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
    await asyncUpdate(this.fd, options)
  }

  async set(options: LinuxSetOptions): Promise<void> {
    if (typeof options !== 'object') {
      throw new TypeError('"options" is not an object')
    }
    debug('set')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
    await asyncSet(this.fd, options)
  }

  async get(): Promise<LinuxPortStatus> {
    debug('get')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
    return asyncGet(this.fd)
  }

  async getBaudRate(): Promise<{ baudRate: number }> {
    debug('getBaudRate')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
    return asyncGetBaudRate(this.fd)
  }

  async flush(): Promise<void> {
    debug('flush')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
    await asyncFlush(this.fd)
  }

  async drain(): Promise<void> {
    debug('drain')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
    await this.writeOperation
    await asyncDrain(this.fd)
  }
}
