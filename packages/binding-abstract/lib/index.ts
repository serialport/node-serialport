import debugFactory from 'debug'
const debug = debugFactory('serialport/binding-abstract')

export interface ConstructorOptions extends LocalState, PortInfo {
  descriptor: number
}

export interface OpenOptions extends LocalState {
  path: string
}

export interface PortInfo {
  path: string
  manufacturer?: string
  serialNumber?: string
  locationId?: string
  productId?: string
  vendorId?: string
}

export interface UpdateOptions {
  /* the baud rate */
  baudRate?: number
  /* rts side of the local rts => remote cts link */
  rts?: boolean
  /* Data terminal Ready usually local DTR => remote DSR */
  dtr?: boolean

  /* Break Suspends character transmission */
  brk?: boolean
}

export interface LocalState {
  /* The system reported baud rate */
  baudRate: number

  dataBits: 5 | 6 | 7 | 8
  stopBits: 1 | 1.5 | 2
  parity: 'none' | 'even' | 'mark' | 'odd' | 'space'
  lock: boolean

  /* enable rts/cts control flow, disables manually setting rts */
  rtscts: boolean

  /* Request To Send local status (local RTS => remote CTS) */
  rts: boolean

  /* Data terminal Ready local status (local DTR => remote DSR) */
  dtr: boolean

  /* Break Suspends character transmission local status */
  brk: boolean
}

export interface RemoteStatus {
  /* Data Carrier Detect remote status */
  dcd: boolean

  /* Clear To Send remote status (remote RTS => local CTS) */
  cts: boolean

  /* Data Set Ready remote status (local DSR => remote DTR) */
  dsr: boolean
}

type PortStatus = LocalState & RemoteStatus

/**
 * You never have to use `Binding` objects directly. SerialPort uses them to access the underlying hardware. This documentation is geared towards people who are making bindings for different platforms. This class can be inherited from to get type checking for each method.
 */
export class AbstractBinding implements PortInfo, LocalState {
  /* the open path */
  path: string

  /* The system reported baud rate */
  baudRate: number

  dataBits: 5 | 6 | 7 | 8
  stopBits: 1 | 1.5 | 2
  parity: 'none' | 'even' | 'mark' | 'odd' | 'space'
  lock: boolean

  /* enable rts/cts control flow, disables manually setting rts */
  rtscts: boolean

  /* Request To Send local status (local RTS => remote CTS) */
  rts: boolean

  /* Data terminal Ready local status (local DTR => remote DSR) */
  dtr: boolean

  /* Break Suspends character transmission local status */
  brk: boolean

  manufacturer?: string
  serialNumber?: string
  locationId?: string
  productId?: string
  vendorId?: string

  isOpen: boolean
  descriptor: number
  /**
   * Retrieves a list of available serial ports with metadata. The `comName` must be guaranteed, and all other fields should be undefined if unavailable. The `comName` is either the path or an identifier (eg `COM1`) used to open the serialport.
   */
  static async list(): Promise<PortInfo[]> {
    debug('list')
    return []
  }

  static async open(options: OpenOptions) {
    return new AbstractBinding({
      ...options,
      descriptor: 1
    })
  }

  constructor(opt: ConstructorOptions) {
    if (typeof opt !== 'object') {
      throw new TypeError('"options" is not an object')
    }
    this.isOpen = true
    const { path, baudRate, dataBits, stopBits, parity, lock, rtscts, rts, dtr, brk, manufacturer, serialNumber, locationId, productId, vendorId, descriptor } = opt
    this.path = path
    this.baudRate = baudRate
    this.dataBits = dataBits
    this.stopBits = stopBits
    this.parity = parity
    this.lock = lock
    this.rtscts = rtscts
    this.rts = rts
    this.dtr = dtr
    this.brk = brk
    this.manufacturer = manufacturer
    this.serialNumber = serialNumber
    this.locationId = locationId
    this.productId = productId
    this.vendorId = vendorId
    this.descriptor = descriptor
    this.descriptor = opt.descriptor
  }

  /**
   * Closes an open connection
   */
  async close(): Promise<void> {
    debug('close')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
  }

  /**
   * Request a number of bytes from the SerialPort. This function is similar to Node's [`fs.read`](http://nodejs.org/api/fs.html#fs_fs_read_fd_buffer_offset_length_position_callback) except it will always return at least one byte.

The in progress reads must error when the port is closed with an error object that has the property `canceled` equal to `true`. Any other error will cause a disconnection.

   * @param {buffer} buffer Accepts a [`Buffer`](http://nodejs.org/api/buffer.html) object.
   * @param {integer} offset The offset in the buffer to start writing at.
   * @param {integer} length Specifies the maximum number of bytes to read.
   * @returns {Promise<number>} Resolves with the number of bytes read after a read operation.
   */
  async read(buffer: Buffer, offset: number, length: number): Promise<number> {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('"buffer" is not a Buffer')
    }

    if (typeof offset !== 'number') {
      throw new TypeError('"offset" is not an integer')
    }

    if (typeof length !== 'number') {
      throw new TypeError('"length" is not an integer')
    }

    debug('read')
    if (buffer.length < offset + length) {
      throw new Error('buffer is too small')
    }

    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
    return 0
  }

  /**
   * Write bytes to the SerialPort. Only called when there is no pending write operation.

The in progress writes must error when the port is closed with an error object that has the property `canceled` equal to `true`. Any other error will cause a disconnection.
   */
  async write(buffer: Buffer) {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('"buffer" is not a Buffer')
    }

    debug('write', buffer.length, 'bytes')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
  }

  /**
   * Changes connection settings on an open port. Only `baudRate` is supported.
   * @param {object=} options Only supports `baudRate`.
   * @param {number=} [options.baudRate] If provided a baud rate that the bindings do not support, it should reject.
   * @returns {Promise} Resolves once the port's baud rate changes.
   * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
   */
  async update(options: UpdateOptions) {
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
  }

  /**
   * Get the control flags (brk, cts, dsr, dtr, rts) on the open port.
   */
  async status(): Promise<PortStatus> {
    debug('status')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
    return {
      baudRate: NaN,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      lock: false,
      rtscts: false,
      brk: false,
      cts: false,
      dsr: false,
      dtr: false,
      rts: false,
      dcd: false
    }
  }

  /**
   * Flush (discard) data received but not read, and written but not transmitted.
   */
  async flush() {
    debug('flush')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
  }

  /**
   * Drain waits until all output data is transmitted to the serial port. An in progress write should be completed before this returns.
   */
  async drain() {
    debug('drain')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
  }
}

export default AbstractBinding
