import { Transform, TransformCallback, TransformOptions } from 'stream'

export interface DelimiterOptions extends TransformOptions {
  includeDelimiter?: boolean
  /** the number of bytes on each data event */
  delimiter: string | Buffer | number[]
}

/**
 * A transform stream that emits data each time a byte sequence is received.
 * @extends Transform
 *
 * To use the `Delimiter` parser, provide a delimiter as a string, buffer, or array of bytes. Runs in O(n) time.
 * @example
const SerialPort = require('serialport')
const {DelimiterParser} = require('@serialport/parser-delimiter')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new DelimiterParser({ delimiter: '\n' }))
parser.on('data', console.log)
 */
export class DelimiterParser extends Transform {
  includeDelimiter: boolean
  delimiter: Buffer
  buffer: Buffer
  constructor(options: DelimiterOptions) {
    super(options)

    if (options.delimiter === undefined) {
      throw new TypeError('"delimiter" is not a bufferable object')
    }

    if (options.delimiter.length === 0) {
      throw new TypeError('"delimiter" has a 0 or undefined length')
    }

    this.includeDelimiter = options.includeDelimiter !== undefined ? options.includeDelimiter : false
    this.delimiter = Buffer.from(options.delimiter)
    this.buffer = Buffer.alloc(0)
  }

  _transform(chunk: Buffer, encoding: any, cb: TransformCallback) {
    let data = Buffer.concat([this.buffer, chunk])
    let position
    while ((position = data.indexOf(this.delimiter)) !== -1) {
      this.push(data.slice(0, position + (this.includeDelimiter ? this.delimiter.length : 0)))
      data = data.slice(position + this.delimiter.length)
    }
    this.buffer = data
    cb()
  }

  _flush(cb: TransformCallback) {
    this.push(this.buffer)
    this.buffer = Buffer.alloc(0)
    cb()
  }
}
