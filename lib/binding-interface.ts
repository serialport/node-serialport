/**
  Serial port info with metadata. Only the `path` is guaranteed. If unavailable the other fields will be undefined. The `path` is either the path or an identifier (eg `COM1`) used to open the SerialPort.

  We make an effort to identify the hardware attached and have consistent results between systems. Linux and OS X are mostly consistent. Windows relies on 3rd party device drivers for the information and is unable to guarantee the information. On windows If you have a USB connected device can we provide a serial number otherwise it will be `undefined`. The `pnpId` and `locationId` are not the same or present on all systems. The examples below were run with the same Arduino Uno.
*/
export interface PortInfo {
  path: string
  manufacturer: string | undefined
  serialNumber: string | undefined
  pnpId: string | undefined
  locationId: string | undefined
  productId: string | undefined
  vendorId: string | undefined
}

export interface OpenOptions {
  /** The baud rate of the port to be opened. This should match one of the commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, or 115200. Custom rates are supported best effort per platform. The device connected to the serial port is not guaranteed to support the requested baud rate, even if the port itself supports that baud rate. */
  baudRate: number
  /** Must be one of these: 8, 7, 6, or 5  */
  dataBits: 8 | 7 | 6 | 5
  /** Prevent other processes from opening the port. Windows does not currently support `false`. */
  lock: boolean
  stopBits: 1 | 2
  parity: 'none' | 'event' | 'mark' | 'odd' | 'space'
  /** Flow control Setting */
  rtscts: boolean
  /** Flow control Setting */
  xon: boolean
  /** Flow control Setting */
  xoff: boolean
  /** Flow control Setting */
  xany: boolean
  /** drop DTR on close */
  hupcl: boolean
}

export interface UpdateOptions {
  /** If provided a baud rate that the bindings do not support, it should reject */
  baudRate: number
}

export interface SetOptions {
  brk?: boolean
  cts?: boolean
  dsr?: boolean
  dtr?: boolean
  rts?: boolean
}

export interface PortStatus {
  cts: boolean
  dsr: boolean
  dcd: boolean
}

/**
 * You never have to use `Binding` objects directly. SerialPort uses them to access the underlying hardware. This documentation is geared towards people who are making bindings for different platforms. This interface is implemented in all bindings.
 */
export abstract class BindingInterface {
  /**
    Retrieves a list of available serial ports with metadata. The `path` must be guaranteed, and all other fields should be undefined if unavailable. The `path` is either the path or an identifier (eg `COM1`) used to open the serialport.
   */
  static async list(): Promise<PortInfo[]> {
    throw new Error('Method not implemented.')
  }

  /**
   * Required property. `true` if the port is open, `false` otherwise. Should be read-only.
   */
  abstract isOpen: boolean

  /**
   * Opens a connection to the serial port referenced by the path.
   */
  abstract open(path: string, options?: OpenOptions): Promise<void>

  /**
   * Closes an open connection
   */
  abstract close(): Promise<void>

  /**
    Request a number of bytes from the SerialPort. This function is similar to Node's [`fs.read`](http://nodejs.org/api/fs.html#fs_fs_read_fd_buffer_offset_length_position_callback) except it will always return at least one byte.

    The in progress reads must error when the port is closed with an error object that has the property `canceled` equal to `true`. Any other error will cause a disconnection.

   * @param offset The offset in the buffer to start writing at.
   * @param length Specifies the maximum number of bytes to read.
   * @returns {Promise} Resolves with the number of bytes read after a read operation.
   */
  abstract read(buffer: Buffer, offset: number, length: number): Promise<{ buffer: Buffer; bytesRead: number }>

  /**
  Write bytes to the SerialPort. Only called when there is no pending write operation.

  The in progress writes must error when the port is closed with an error object that has the property `canceled` equal to `true`. Any other error will cause a disconnection.

  Resolves after the data is passed to the operating system for writing.
   */
  abstract write(buffer: Buffer): Promise<void>

  /**
    Changes connection settings on an open port.
   */
  abstract update(options: UpdateOptions): Promise<void>

  /**
   * Set control flags on an open port.
   * All options are operating system default when the port is opened. Every flag is set on each call to the provided or default values.
   */
  abstract set(options: SetOptions): Promise<void>

  /**
   * Get the control flags (CTS, DSR, DCD) on the open port.
   */
  abstract get(): Promise<PortStatus>

  /**
   * Get the OS reported baud rate for the open port.
   * Used mostly for debugging custom baud rates.
   */
  abstract getBaudRate(): Promise<{ baudRate: number }>

  /**
   * Flush (discard) data received but not read, and written but not transmitted.
   * Resolves once the flush operation finishes.
   */
  abstract flush(): Promise<void>

  /**
   * Drain waits until all output data is transmitted to the serial port. An in progress write should be completed before this returns.
   * Resolves once the drain operation finishes.
   */
  abstract drain(): Promise<void>
}
