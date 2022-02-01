import debugFactory from 'debug'
import { BindingPortInterface, BindingsError } from '.'
import { BindingInterface, OpenOptions, PortInfo, PortStatus, SetOptions, UpdateOptions } from '@serialport/bindings-interface'
import { asyncClose, asyncDrain, asyncFlush, asyncGet, asyncGetBaudRate, asyncList, asyncOpen, asyncRead, asyncSet, asyncUpdate, asyncWrite } from './load-bindings'
import { serialNumParser } from './win32-sn-parser'

const debug = debugFactory('serialport/bindings-cpp')

export interface WindowsOpenOptions extends OpenOptions {
  /** Device parity defaults to none */
  parity?: 'none' | 'even' | 'odd' | 'mark' |'space'
}

export type WindowsBindingInterface = BindingInterface<WindowsPortBinding, WindowsOpenOptions>

export const WindowsBinding: WindowsBindingInterface = {
  async list() {
    const ports: PortInfo[] = await asyncList()
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
    const openOptions: Required<OpenOptions> = {
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

    const fd = await asyncOpen(openOptions.path, openOptions)
    return new WindowsPortBinding(fd, openOptions)
  },
}

/**
 * The Windows binding layer
 */
export class WindowsPortBinding implements BindingPortInterface {
  fd: null | number
  writeOperation: Promise<void> | null
  openOptions: Required<OpenOptions>

  constructor(fd: number, options: Required<OpenOptions>) {
    this.fd = fd
    this.openOptions = options
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
    this.fd = null
    await asyncClose(fd)
  }

  async read(buffer: Buffer, offset: number, length: number): Promise<{
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
    try {
      const bytesRead = await asyncRead(this.fd, buffer, offset, length)
      return { bytesRead, buffer }
    } catch (err) {
      if (!this.isOpen) {
        throw new BindingsError(err.message, { canceled: true })
      }
      throw err
    }
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
      await asyncWrite(this.fd, buffer)
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
