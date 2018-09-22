import { Transform, TransformOptions } from 'stream'

export interface RegexParserOptions extends TransformOptions {
  readonly regex?: RegExp
}

/**
 * A transform stream that uses a regular expression to split the incoming text upon.
 *
 * To use the `Regex` parser provide a regular expression to split the incoming text upon. Data is emitted as string controllable by the `encoding` option (defaults to `utf8`).
 * @extends Transform
 * @example
const SerialPort = require('serialport')
const Regex = require('@serialport/parser-regex')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new Regex({ regex: /[\r\n]+/ }))
parser.on('data', console.log)
 */
export class RegexParser extends Transform {
  // tslint:disable-next-line:readonly-keyword
  data: string
  readonly regex: RegExp

  constructor(options: RegexParserOptions) {
    const opts = Object.assign(
      {
        encoding: 'utf8',
      },
      options
    )
    if (opts.regex === undefined) {
      throw new TypeError('"options.regex" must be a regular expression string or object')
    }
    super(opts)
    this.regex = opts.regex instanceof RegExp ? opts.regex : new RegExp(opts.regex)
    this.data = ''
  }

  _flush(cb: () => void) {
    this.push(this.data)
    this.data = ''
    cb()
  }

  _transform(chunk: string, _encoding: string, cb: () => void) {
    const data = this.data + chunk
    const parts = data.split(this.regex)
    this.data = parts.pop() || ''

    parts.forEach(part => {
      this.push(part)
    })
    cb()
  }
}
