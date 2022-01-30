import debugFactory from 'debug'
import { BindingPortInterface } from '.'
import { BindingInterface, OpenOptions, PortStatus, SetOptions, UpdateOptions } from './binding-interface'
import { asyncClose, asyncDrain, asyncFlush, asyncGet, asyncList, asyncOpen, asyncSet, asyncUpdate } from './load-bindings'
import { Poller } from './poller'
import { unixRead } from './unix-read'
import { unixWrite } from './unix-write'

const debug = debugFactory('serialport/bindings-cpp')

export interface DarwinOpenOptions extends OpenOptions {
  /** see [`man termios`](http://linux.die.net/man/3/termios) defaults to 1 */
  vmin?: number
  /** see [`man termios`](http://linux.die.net/man/3/termios) defaults to 0 */
  vtime?: number
}

export const DarwinBinding: BindingInterface<DarwinPortBinding, DarwinOpenOptions> = {
  list() {
    debug('list')
    return asyncList()
  },
  async open(options) {
    if (!options || typeof options !== 'object' || Array.isArray(options)) {
      throw new TypeError('"options" is not an object')
    }

    if (!options.path) {
      throw new TypeError('"path" is not a valid port')
    }

    if (!options.baudRate) {
      throw new TypeError('"baudRate" is not a valid baudRate')
    }

    debug('open')

    const openOptions: Required<DarwinOpenOptions> = {
      vmin: 1,
      vtime: 0,
      dataBits: 8,
      lock: true,
      stopBits: 1,
      parity: 'none',
      rtscts: false,
      xon: false,
      xoff: false,
      xany: false,
      hupcl: true,
      ...options,
    }
    const fd: number = await asyncOpen(openOptions.path, openOptions)
    return new DarwinPortBinding(fd, openOptions)
  },
}

/**
 * The Darwin binding layer for OSX
 */
export class DarwinPortBinding implements BindingPortInterface {
  readonly openOptions: Required<DarwinOpenOptions>
  readonly poller: Poller
  fd: null | number
  writeOperation: Promise<void> | null

  constructor(fd:number, options: Required<DarwinOpenOptions>) {
    this.fd = fd
    this.openOptions = options
    this.poller = new Poller(fd)
    this.writeOperation = null
  }

  get isOpen() {
    return this.fd !== null
  }

  async close(): Promise<void> {
    debug('close')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }

    const fd = this.fd
    this.poller.stop()
    this.poller.destroy()
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
    if (!options || typeof options !== 'object' || Array.isArray(options)) {

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

  async set(options: SetOptions): Promise<void> {
    if (!options || typeof options !== 'object' || Array.isArray(options)) {

      throw new TypeError('"options" is not an object')
    }
    debug('set', options)
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
    await asyncSet(this.fd, options)
  }

  async get(): Promise<PortStatus> {
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
    throw new Error('getBaudRate is not implemented on darwin')
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
