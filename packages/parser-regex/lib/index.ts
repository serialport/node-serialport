import { Transform, TransformCallback, TransformOptions } from 'stream'

export interface RegexParserOptions extends TransformOptions {
  regex: RegExp | string | Buffer
}

/**
 * A transform stream that uses a regular expression to split the incoming text upon.
 *
 * To use the `Regex` parser provide a regular expression to split the incoming text upon. Data is emitted as string controllable by the `encoding` option (defaults to `utf8`).
 *
 * @example
const SerialPort = require('serialport')
const Regex = require('@serialport/parser-regex')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new Regex({ regex: /[\r\n]+/ }))
parser.on('data', console.log)
 */
export class RegexParser extends Transform {
  regex: RegExp
  data: string

  constructor({regex, ...options}: RegexParserOptions) {
    const opts = {
      encoding: 'utf8' as BufferEncoding,
      ...options,
    }

    if (regex === undefined) {
      throw new TypeError('"options.regex" must be a regular expression pattern or object')
    }

    if (!(regex instanceof RegExp)) {
      regex = new RegExp(regex.toString())
    }
    super(opts)

    this.regex = regex
    this.data = ''
  }

  _transform(chunk: string, encoding: any, cb: TransformCallback) {
    const data = this.data + chunk
    const parts = data.split(this.regex)
    this.data = parts.pop() || ''

    parts.forEach(part => {
      this.push(part)
    })
    cb()
  }

  _flush(cb: TransformCallback) {
    this.push(this.data)
    this.data = ''
    cb()
  }
}
