const Transform = require('stream').Transform
const Bl = require('bl')
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
class DelimiterParser extends Transform {
  constructor(options = {}) {
    super(options)

    if (options.delimiter === undefined) {
      throw new TypeError('"delimiter" is not a bufferable object')
    }

    if (options.delimiter.length === 0) {
      throw new TypeError('"delimiter" has a 0 or undefined length')
    }

    this.includeDelimiter = options.includeDelimiter !== undefined ? options.includeDelimiter : false
    this.delimiter = Buffer.from(options.delimiter)
    this.buffer = new Bl()
  }

  _transform(chunk, encoding, cb) {
    let data = this.buffer.append(chunk)
    let position
    while ((position = data.indexOf(this.delimiter)) !== -1) {
      this.push(data.slice(0, position + (this.includeDelimiter ? this.delimiter.length : 0)))
      data = data.shallowSlice(position + this.delimiter.length)
    }
    this.buffer = data
    cb()
  }

  _flush(cb) {
    this.push(this.buffer.slice())
    this.buffer = new Bl()
    cb()
  }
}

module.exports = DelimiterParser
