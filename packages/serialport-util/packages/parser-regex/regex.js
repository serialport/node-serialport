'use strict'
const Transform = require('stream').Transform

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
class RegexParser extends Transform {
  constructor (options) {
    const opts = Object.assign({
      encoding: 'utf8'
    }, options)

    if (opts.regex === undefined) {
      throw new TypeError('"options.regex" must be a regular expression pattern or object')
    }

    if (!(opts.regex instanceof RegExp)) {
      opts.regex = new RegExp(opts.regex)
    }
    super(opts)

    this.regex = opts.regex
    this.data = ''
  }

  _transform (chunk, encoding, cb) {
    const data = this.data + chunk
    const parts = data.split(this.regex)
    this.data = parts.pop()

    parts.forEach((part) => {
      this.push(part)
    })
    cb()
  }

  _flush (cb) {
    this.push(this.data)
    this.data = ''
    cb()
  }
}

module.exports = RegexParser
