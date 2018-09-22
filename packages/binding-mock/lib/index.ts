// tslint:disable:member-ordering readonly-keyword
import { AbstractBinding, PortInfo, ConstructorOptions, OpenOptions, RemoteState, LocalState } from '@serialport/binding-abstract'
import debug from 'debug'
const logger = debug('serialport/binding-mock')

export { AbstractBinding, PortInfo, ConstructorOptions, OpenOptions, RemoteState, LocalState }

function deferred<T>(): {
  resolve: (data?: T) => void
  reject: (error: Error) => void
  promise: Promise<T>
} {
  let resolve
  let reject
  const promise: Promise<T> = new Promise((pResolve, pReject) => {
    resolve = pResolve
    reject = pReject
  })
  return {
    resolve,
    reject,
    promise,
  } as any
}

const ports: Map<string, MockPort> = new Map()
let nextSerialNumber = 0

interface MockPort {
  cts: boolean
  dcd: boolean
  dsr: boolean
  dataToRead: Buffer
  serialNumber: number
  echo: boolean
  record: boolean
  readyData: null | Buffer
  info: PortInfo
  recording: Buffer | null
}

// tslint:disable-next-line:readonly-array
type QueuedReads = Array<{
  resolve: (data: number) => void
  reject: (error: Error) => void
  buffer: Buffer
  offset: number
  length: number
}>

// tslint:disable-next-line:readonly-array
type QueuedWrites = Array<{
  resolve: () => void
  reject: (error: Error) => void
  data: Buffer
}>

export interface CreatePortOptions {
  path: string
  echo?: boolean
  record?: boolean
  readData?: Buffer
  readyData?: Buffer | string
}

function resolveLater<T>(value?: T) {
  return new Promise(resolve => setImmediate(() => resolve(value))) as Promise<T>
}

function getMockPort(path: string) {
  const mock = ports.get(path)
  if (!mock) {
    throw new Error(`Port does not exist. Call MockBinding.createPort('${path}') before trying to open it`)
  }
  return mock
}

/**
 * Mock bindings for pretend serialport access
 */
export class MockBinding implements AbstractBinding {
  /**
   * Reset mocks
   */
  static reset() {
    ports.clear()
  }

  /**
   * Create a mock Port for opening later
   */
  static createPort({ path, echo = false, record = false, readyData = 'READY' }: CreatePortOptions) {
    nextSerialNumber++
    ports.set(path, {
      dataToRead: Buffer.alloc(0),
      serialNumber: nextSerialNumber,
      echo,
      record,
      recording: record ? Buffer.alloc(0) : null,
      readyData: Buffer.isBuffer(readyData) ? readyData : Buffer.from(readyData),
      dcd: false,
      dsr: false,
      cts: false,
      info: {
        path,
        manufacturer: 'The J5 Robotics Company',
        serialNumber: String(nextSerialNumber),
      },
    })
    logger(nextSerialNumber, 'created port', JSON.stringify({ path, echo, record, readyData }))
  }

  static async list() {
    return Array.from(ports.values()).map(({ info }) => info)
  }

  static async open({
    path,
    baudRate,
    brk = false,
    dataBits = 8,
    dtr = false,
    lock = false,
    parity = 'none',
    rts = false,
    rtscts = false,
    stopBits = 1,
  }: OpenOptions) {
    const mock = getMockPort(path)
    const serialNumber = mock.serialNumber
    logger(serialNumber, 'open', {
      path,
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
    await resolveLater()
    logger(serialNumber, 'port is open')
    const mockPort = new MockBinding({
      baudRate,
      brk,
      dataBits,
      descriptor: serialNumber,
      dtr,
      lock,
      manufacturer: 'Johnny-Five Robot Company',
      parity,
      path,
      rts,
      rtscts,
      stopBits,
    })

    const readyData = mock.readyData
    if (readyData) {
      setImmediate(() => {
        logger(serialNumber, 'emitting ready data')
        mockPort.emitData(readyData)
      })
    }
    return mockPort
  }

  baudRate: number
  brk: boolean
  dataBits: 5 | 6 | 7 | 8
  descriptor: number
  dtr: boolean
  isClosed: boolean
  lastWrite: any
  locationId: string | undefined
  lock: boolean
  manufacturer?: string | undefined
  parity: 'none' | 'even' | 'mark' | 'odd' | 'space'
  path: string
  pnpId?: string | undefined
  productId?: string | undefined
  rts: boolean
  rtscts: boolean
  serialNumber: string | undefined
  stopBits: 1 | 1.5 | 2
  vendorId: string | undefined
  queuedWrites: QueuedWrites
  queuedReads: QueuedReads
  inflightWrite: boolean
  inflightRead: boolean

  constructor({
    descriptor,
    path,
    serialNumber,
    baudRate,
    locationId,
    manufacturer,
    pnpId,
    productId,
    vendorId,
    brk,
    dataBits,
    dtr,
    lock,
    parity,
    rts,
    rtscts,
    stopBits,
  }: ConstructorOptions) {
    this.lastWrite = null
    this.queuedReads = []
    this.queuedWrites = []
    this.inflightWrite = false
    this.inflightRead = false
    this.isClosed = false

    // from open
    this.descriptor = descriptor

    // port info
    this.path = path
    this.locationId = locationId
    this.manufacturer = manufacturer
    this.pnpId = pnpId
    this.productId = productId
    this.serialNumber = serialNumber
    this.vendorId = vendorId

    // local state
    this.baudRate = baudRate
    this.brk = brk
    this.dataBits = dataBits
    this.dtr = dtr
    this.lock = lock
    this.parity = parity
    this.rts = rts
    this.rtscts = rtscts
    this.stopBits = stopBits
  }

  /**
   * Emit data on a mock port
   */
  emitData(inData: Buffer | string | ReadonlyArray<number>) {
    if (this.isClosed) {
      throw new Error('Port must be open to pretend to receive data')
    }
    const mock = getMockPort(this.path)
    const data = Buffer.isBuffer(inData) ? inData : Buffer.from(inData as any)
    logger(this.serialNumber, 'emitting data')
    mock.dataToRead = Buffer.concat([mock.dataToRead, data])
    this._processReadQueue()
  }

  /**
   * mock remote state on a port
   */
  setRemoteState({ cts, dcd, dsr }: Partial<RemoteState>) {
    const mock = getMockPort(this.path)
    if (cts !== undefined) {
      mock.cts = cts
    }
    if (dcd !== undefined) {
      mock.dcd = dcd
    }
    if (dsr !== undefined) {
      mock.dsr = dsr
    }
  }

  async close() {
    logger(this.serialNumber, 'closing port')
    await this.ensureOpenLater()
    logger(this.serialNumber, 'port is closed')
    this.isClosed = true
    this._processReadQueue()
  }

  async read(buffer: Buffer, offset: number, length: number): Promise<number> {
    logger(this.serialNumber, 'read', offset, length)
    this.ensureOpen()
    logger(this.serialNumber, 'enqueueing read', length, 'bytes')

    const { promise, reject, resolve } = deferred<number>()

    this.queuedReads.push({
      resolve,
      reject,
      buffer,
      offset,
      length,
    })
    this._processReadQueue()
    return promise
  }

  private async _processReadQueue(): Promise<void> {
    if (this.inflightRead) {
      return
    }
    this.inflightRead = true
    const mock = getMockPort(this.path)
    let readOperation

    if (this.isClosed) { // cancel reads
      while ((readOperation = this.queuedReads.pop())) {
        const { resolve } = readOperation
        resolve(0)
      }
      return
    }

    if (mock.dataToRead.length === 0) {
      return
    }

    // tslint:disable-next-line:no-conditional-assignment
    while ((readOperation = this.queuedReads.pop())) {
      const { resolve, buffer, offset, length } = readOperation
      logger(this.serialNumber, 'reading', length, 'bytes')

      await resolveLater()

      if (this.isClosed) {
        resolve(0)
        continue
      }
      const data = mock.dataToRead.slice(0, length)
      const readLength = data.copy(buffer, offset)
      mock.dataToRead = mock.dataToRead.slice(readLength)
      logger(this.serialNumber, 'read', readLength, 'bytes')
      resolve(readLength)
      if (mock.dataToRead.length === 0) {
        break
      }
    }
    this.inflightRead = false
  }

  async write(data: Buffer) {
    if (!Buffer.isBuffer(data)) {
      logger(this.serialNumber, 'writing')
      throw new TypeError('"buffer" is not a Buffer')
    }
    this.ensureOpen()
    logger(this.serialNumber, 'enqueueing write', data.length, 'bytes')
    const { resolve, reject, promise } = deferred<void>()
    this.queuedWrites.push({
      resolve,
      reject,
      data,
    })
    this._processWriteQueue()
    return promise
  }

  async _processWriteQueue() {
    if (this.inflightWrite) {
      return
    }
    this.inflightWrite = true
    const mock = getMockPort(this.path)
    let writeOperation
    // tslint:disable-next-line:no-conditional-assignment
    while ((writeOperation = this.queuedWrites.pop())) {
      const { resolve, reject, data } = writeOperation
      logger(this.serialNumber, 'writing', data.length, 'bytes')
      try {
        await this.ensureOpenLater()
        this.lastWrite = data
        if (mock.record) {
          mock.recording = mock.recording ? Buffer.concat([mock.recording, data]): Buffer.from(data)
        }
        if (mock.echo) {
          this.emitData(data)
        }
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    this.inflightWrite = false
  }

  async setLocalState({ baudRate, brk, dataBits, dtr, lock, parity, rts, rtscts, stopBits }: Partial<LocalState>): Promise<LocalState> {
    logger('update', { baudRate, brk, dataBits, dtr, lock, parity, rts, rtscts, stopBits })

    await this.ensureOpenLater()

    if (baudRate !== undefined) {
      this.baudRate = baudRate
    }
    if (brk !== undefined) {
      this.brk = brk
    }
    if (dataBits !== undefined) {
      this.dataBits = dataBits
    }
    if (dtr !== undefined) {
      this.dtr = dtr
    }
    if (lock !== undefined) {
      this.lock = lock
    }
    if (parity !== undefined) {
      this.parity = parity
    }
    if (rts !== undefined) {
      this.rts = rts
    }
    if (rtscts !== undefined) {
      this.rtscts = rtscts
    }
    if (stopBits !== undefined) {
      this.stopBits = stopBits
    }

    return {
      baudRate: this.baudRate,
      brk: this.brk,
      dataBits: this.dataBits,
      dtr: this.dtr,
      lock: this.lock,
      parity: this.parity,
      rts: this.rts,
      rtscts: this.rtscts,
      stopBits: this.stopBits,
    }
  }

  async flush() {
    await this.ensureOpenLater()
    const mock = getMockPort(this.path)
    mock.dataToRead = Buffer.alloc(0)
    // error writes
    // stop reads
  }

  async drain() {
    this.ensureOpen()
    await this.inflightWrite
    this.ensureOpen()
    await resolveLater()
  }

  async getRemoteState(): Promise<RemoteState> {
    await this.ensureOpenLater()
    const { cts, dsr, dcd } = getMockPort(this.path)
    return {
      cts,
      dsr,
      dcd,
    }
  }

  private ensureOpen() {
    if (this.isClosed) {
      throw new Error('Port is not open')
    }
  }

  private async ensureOpenLater() {
    this.ensureOpen()
    await resolveLater()
    this.ensureOpen()
  }
}
