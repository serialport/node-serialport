import { Transform, TransformOptions } from 'stream'

export interface ByteLengthOptions extends TransformOptions {
  /**
   * the number of bytes on each data event
   */
  readonly length?: number
}

/**
 * Emit data every number of bytes
 * @summary A transform stream that emits data as a buffer after a specific number of bytes are received. Runs in O(n) time.
 * @example
  const SerialPort = require('serialport')
  const ByteLength = require('@serialport/parser-byte-length')
  const port = new SerialPort('/dev/tty-usbserial1')
  const parser = port.pipe(new ByteLength({length: 8}))
  parser.on('data', console.log) // will have 8 bytes per data event
 */
export class ByteLengthParser extends Transform {
  readonly buffer: Buffer
  readonly length: number
  // tslint:disable-next-line:readonly-keyword
  position: number
  constructor(options: ByteLengthOptions = {}) {
    super(options)

    if (typeof options.length !== 'number') {
      throw new TypeError('"length" is not a number')
    }

    if (options.length < 1) {
      throw new TypeError('"length" is not greater than 0')
    }

    this.length = options.length
    this.position = 0
    this.buffer = Buffer.alloc(this.length)
  }

  _flush(cb: () => void) {
    this.push(this.buffer.slice(0, this.position))
    this.position = 0
    cb()
  }

  _transform(chunk: Buffer, _encoding: string, cb: () => void) {
    let cursor = 0
    while (cursor < chunk.length) {
      this.buffer[this.position] = chunk[cursor]
      cursor++
      this.position++
      if (this.position === this.length) {
        this.push(this.buffer.slice())
        this.position = 0
      }
    }
    cb()
  }
}
