export interface PortInfo {
  readonly locationId?: string
  readonly manufacturer?: string
  readonly path: string
  readonly pnpId?: string
  readonly productId?: string
  readonly serialNumber?: string
  readonly vendorId?: string
}

export interface LocalState {
  /* The system reported baud rate */
  readonly baudRate: number
  /* Break Suspends character transmission local status */
  readonly brk: boolean
  readonly dataBits: 5 | 6 | 7 | 8
  /* Data terminal Ready local status (local DTR => remote DSR) */
  readonly dtr: boolean
  readonly lock: boolean
  readonly parity: 'none' | 'even' | 'mark' | 'odd' | 'space'
  /* Request To Send local status (local RTS => remote CTS) */
  readonly rts: boolean
  /* enable rts/cts control flow, disables manually setting rts */
  readonly rtscts: boolean
  readonly stopBits: 1 | 1.5 | 2
}

export interface ConstructorOptions extends PortInfo, LocalState {
  readonly descriptor: number
}

export interface OpenOptions extends Partial<LocalState> {
  readonly baudRate: number
  readonly path: string
}

export interface RemoteState {
  /* Clear To Send remote status (remote RTS => local CTS) */
  readonly cts: boolean
  /* Data Carrier Detect remote status */
  readonly dcd: boolean
  /* Data Set Ready remote status (local DSR => remote DTR) */
  readonly dsr: boolean
}

/**
 * You never have to use `Binding` objects directly. SerialPort uses them to access the underlying hardware.
 */
export class AbstractBinding implements PortInfo, LocalState {
  /**
   * Retrieves a list of available serial ports with metadata. The `comName` must be guaranteed, and all other fields should be undefined if unavailable. The `path` is either the path or an identifier (eg `COM1`) used to open the serialport.
   */
  static async list(): Promise<ReadonlyArray<PortInfo>> {
    throw new Error('#list is not implemented')
  }

  /**
   * Opens a connection to the serial port referenced by the path.
   */
  static async open<T>(this: T, options: OpenOptions): Promise<T> {
    throw new Error('#open is not implemented')
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
  descriptor: any
  isClosed: boolean

  constructor(opt: ConstructorOptions) {
    throw new Error('Cannot create an AbstractBinding constructor not Implemented')
  }

  /**
   * Closes an open connection
   */
  async close() {
    throw new Error('.close is not implemented')
  }

  /**
   * Drain waits until all output data is transmitted to the serial port. An in progress write should be completed before this returns.
   */
  async drain() {
    throw new Error('.drain is not implemented')
  }

  /**
   * Flush (discard) data received but not read, and written but not transmitted. Any in flight write operations that are flushed will fail.
   */
  async flush() {
    throw new Error('.flush is not implemented')
  }

  /**
   * Get the remote state flags (CTS, DSR, DCD) on the open port.
   */
  async getRemoteState(): Promise<RemoteState> {
    throw new Error('.get is not implemented')
  }

  /**
   * Enqueues a request a number of bytes from the SerialPort. This function is similar to Node's [`fs.read`](http://nodejs.org/api/fs.html#fs_fs_read_fd_buffer_offset_length_position_callback) except it will always read at least one byte while the port is open. In progress reads must resolve with any available data when the port is closed, if there is no data when a port is closed read 0 bytes. If a port is flushed a pending read should resolve 0 bytes.
   */
  async read(buffer: Buffer, offset: number, length: number): Promise<number> {
    throw new Error('.read is not implemented')
  }

  /**
   * Set local state on an open port including updating baudRate and control flags. The state is represented on the object as well as resolved in the promise.
   */
  async setLocalState(options: Partial<LocalState>): Promise<LocalState> {
    throw new Error('.setLocalState is not implemented')
  }

  /**
   * Enqueues a write operation of bytes to the SerialPort. Errors if the port is closed during a write. If a port is flushed the write operation should fail.
   */
  async write(buffer: Buffer): Promise<void> {
    throw new Error('.write is not implemented')
  }
}
