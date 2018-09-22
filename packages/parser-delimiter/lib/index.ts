import { Transform, TransformOptions } from 'stream'

export interface DelimiterParserOptions extends TransformOptions {
  readonly delimiter?: any
  readonly includeDelimiter?: boolean
}

/**
 * A transform stream that emits data each time a byte sequence is received.
 * @extends Transform
 * @summary To use the `Delimiter` parser, provide a delimiter as a string, buffer, or array of bytes. Runs in O(n) time.
 * @example
const SerialPort = require('serialport')
const Delimiter = require('@serialport/parser-delimiter')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new Delimiter({ delimiter: '\n' }))
parser.on('data', console.log)
 */
export class DelimiterParser extends Transform {
  // tslint:disable-next-line:readonly-keyword
  buffer: Buffer
  readonly delimiter: Buffer
  readonly includeDelimiter: boolean

  constructor(options: DelimiterParserOptions = {}) {
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

  _flush(cb: () => void) {
    this.push(this.buffer)
    this.buffer = Buffer.alloc(0)
    cb()
  }

  _transform(chunk: Buffer, _encoding: string, cb: () => void) {
    let data = Buffer.concat([this.buffer, chunk])
    let position
    // tslint:disable-next-line:no-conditional-assignment
    while ((position = data.indexOf(this.delimiter)) !== -1) {
      this.push(data.slice(0, position + (this.includeDelimiter ? this.delimiter.length : 0)))
      data = data.slice(position + this.delimiter.length)
    }
    this.buffer = data
    cb()
  }
}
