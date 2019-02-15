// tslint:disable:readonly-keyword
import bindings from 'bindings'
import { AbstractBinding, OpenOptions, ConstructorOptions, RemoteState, LocalState, SetOptions } from '@serialport/binding-abstract'
import debug from 'debug'
import { linuxList } from './linux-list'
import { Poller } from './poller'
import { promisify } from './util'
import { unixRead } from './unix-read'
import { unixWrite } from './unix-write'

const logger = debug('serialport/bindings/LinuxBinding')

interface LinuxConstructorOptions extends ConstructorOptions {
  vmin: number
  vtime: number
}

interface LinuxOpenOptions extends OpenOptions {
  vmin?: number
  vtime?: number
}

const linuxBindings = bindings('bindings.node')
const closeAsync = promisify(linuxBindings.close) as (fd: number) => Promise<void>
const drainAsync = promisify(linuxBindings.drain) as (fd: number) => Promise<void>
const flushAsync = promisify(linuxBindings.flush) as (fd: number) => Promise<void>
const getRemoteStateAsync = promisify(linuxBindings.getRemoteState) as (descriptor: number) => Promise<RemoteState>
const openAsync = promisify(linuxBindings.open) as (opt: LocalState) => Promise<number>
const setLocalStateAsync = promisify(linuxBindings.setLocalState) as (descriptor: number, opts: SetOptions) => Promise<LocalState>

/**
 * The linux binding layer
 */
export class LinuxBinding implements AbstractBinding {
  static list() {
    return linuxList()
  }

  static async open(options: LinuxOpenOptions) {
    logger('open', options)
    if (typeof options !== 'object') {
      throw new TypeError('"options" is not an object')
    }

    const {
      baudRate,
      path,
      brk = false,
      dataBits = 8,
      dtr = true, // need to check if this is possible on windows
      parity = 'none',
      rts = true, // ???
      rtscts = true, // ???
      stopBits = 1,
      lock = true,
      vmin = 1,
      vtime = 0,
    } = options

    if (!path) {
      throw new TypeError('"path" is not a valid port')
    }
    const { locationId, manufacturer, pnpId, productId, serialNumber, vendorId } = {} as any // todo find this info out

    const descriptor = await openAsync({ baudRate, path, brk, dataBits, dtr, parity, rts, rtscts, stopBits, lock })

    return new LinuxBinding({
      descriptor,
      locationId,
      manufacturer,
      path,
      pnpId,
      productId,
      serialNumber,
      vendorId,
      baudRate,
      brk,
      dataBits,
      dtr,
      lock,
      parity,
      rts,
      rtscts,
      stopBits,
      vmin,
      vtime,
    })
  }

  locationId?: string
  manufacturer?: string
  path: string
  pnpId?: string
  productId?: string
  serialNumber?: string
  vendorId?: string
  baudRate: number
  brk: boolean
  dataBits: 5 | 6 | 7 | 8
  dtr: boolean
  lock: boolean
  parity: 'none' | 'even' | 'mark' | 'odd' | 'space'
  rts: boolean
  rtscts: boolean
  stopBits: 1 | 1.5 | 2
  descriptor: number
  isClosed: boolean

  poller: Poller
  writeOperation: any

  constructor(opts: LinuxConstructorOptions) {
    const {
      descriptor,
      locationId,
      manufacturer,
      path,
      pnpId,
      productId,
      serialNumber,
      vendorId,
      baudRate,
      brk,
      dataBits,
      dtr,
      lock,
      parity,
      rts,
      rtscts,
      stopBits,
    } = opts
    this.descriptor = descriptor
    this.locationId = locationId
    this.manufacturer = manufacturer
    this.path = path
    this.pnpId = pnpId
    this.productId = productId
    this.serialNumber = serialNumber
    this.vendorId = vendorId
    this.baudRate = baudRate
    this.brk = brk
    this.dataBits = dataBits
    this.dtr = dtr
    this.lock = lock
    this.parity = parity
    this.rts = rts
    this.rtscts = rtscts
    this.stopBits = stopBits
    this.isClosed = false

    this.writeOperation = null
    this.poller = new Poller(descriptor)
  }

  async close() {
    logger('close')
    this.ensureOpen()
    this.poller.stop()
    this.poller.destroy()
    this.isClosed = true
    return closeAsync(this.descriptor)
  }

  async drain() {
    logger('drain')
    this.ensureOpen()
    await this.writeOperation
    return drainAsync(this.descriptor)
  }

  async flush() {
    logger('flush')
    this.ensureOpen()

    return flushAsync(this.descriptor)
  }

  async getRemoteState() {
    logger('getRemoteState')
    this.ensureOpen()
    return getRemoteStateAsync(this.descriptor)
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
    this.ensureOpen()

    return unixRead(this, buffer, offset, length)
  }

  async setLocalState(options: SetOptions) {
    logger('setLocalState', options)
    this.ensureOpen()
    return setLocalStateAsync(this.descriptor, options)
  }

  async write(buffer: Buffer) {
    if (!Buffer.isBuffer(buffer)) {
      logger('write')
      throw new TypeError('"buffer" is not a Buffer')
    }
    logger('write', buffer.length, 'bytes')
    this.ensureOpen()

    this.writeOperation = unixWrite(this, buffer).then(() => {
      this.writeOperation = null
    })
    return this.writeOperation
  }

  private ensureOpen() {
    if (this.isClosed === true) {
      throw new Error('Port is not open')
    }
  }
}
