// tslint:disable:readonly-keyword
import bindings from 'bindings'
import debug from 'debug'
import { promisify } from './util'
import { AbstractBinding, PortInfo, OpenOptions, ConstructorOptions, LocalState, RemoteState, SetOptions } from '@serialport/binding-abstract'
import { serialNumParser } from './win32-sn-parser'

const logger = debug('serialport/bindings/WindowsBinding')
const windowsBinding = bindings('bindings.node')
const closeAsync = promisify(windowsBinding.close) as (descriptor: number) => Promise<void>
const drainAsync = promisify(windowsBinding.drain) as (descriptor: number) => Promise<void>
const flushAsync = promisify(windowsBinding.flush) as (descriptor: number) => Promise<void>
const getRemoteStateAsync = promisify(windowsBinding.getRemoteState) as (descriptor: number) => Promise<RemoteState>
const openAsync = promisify(windowsBinding.open) as (opt: LocalState) => Promise<number>
const setLocalStateAsync = promisify(windowsBinding.setLocalState) as (descriptor: number, opts: SetOptions) => Promise<LocalState>
const listAsync = promisify(windowsBinding.list) as () => Promise<ReadonlyArray<PortInfo>>
const readAsync = promisify(windowsBinding.read) as (descriptor: number, buffer: Buffer, offset: number, length: number) => Promise<number>
const writeAsync = promisify(windowsBinding.write) as (descriptor: number, buffer: Buffer) => Promise<void>

/**
 * The Windows binding layer
 */
export class WindowsBinding implements AbstractBinding {
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

  static async open(options: OpenOptions) {
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
    } = options

    if (!path) {
      throw new TypeError('"path" is not a valid port')
    }
    const { locationId, manufacturer, pnpId, productId, serialNumber, vendorId } = {} as any // todo find this info out

    const descriptor = await openAsync({ baudRate, path, brk, dataBits, dtr, parity, rts, rtscts, stopBits, lock })
    return new WindowsBinding({
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
    })
  }

  writeOperation: Promise<void> | null
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

  constructor(opts: ConstructorOptions) {
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
  }

  async close() {
    logger('close')
    this.ensureOpen()
    this.isClosed = true
    return closeAsync(this.descriptor)
  }

  async drain() {
    logger('drain')
    this.ensureOpen()
    // await this.writeOperation
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

    try {
      return readAsync(this.descriptor, buffer, offset, length)
    } catch (error) {
      if (this.isClosed) {
        return 0
      }
      throw error
    }
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

    this.writeOperation = writeAsync(this.descriptor, buffer).then(() => {
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
