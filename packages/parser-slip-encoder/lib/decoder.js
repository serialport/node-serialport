const { Transform } = require('stream')

/**
* A transform stream that decodes slip encoded data.
* @extends Transform
* @summary Runs in O(n) time, stripping out slip encoding and emitting decoded data. Optionally,
* custom slip escape and delimiters can be provided.
* @example
// Receive slip encoded data from a serialport and log decoded data
const SerialPort = require('serialport')
const { SlipDecoder } = require('@serialport/parser-slip-encoder')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new SlipDecoder())
parser.on('data', console.log)
*/
class SlipDecoder extends Transform {
  constructor(options = {}) {
    super(options)

    const opts = {
      START: undefined,
      ESC: 0xdb,
      END: 0xc0,

      ESC_START: undefined,
      ESC_END: 0xdc,
      ESC_ESC: 0xdd,

      ...options,
    }
    this.opts = opts

    this.buffer = Buffer.alloc(0)
    this.escape = false
    this.start = false
  }

  _transform(chunk, encoding, cb) {
    for (let ndx = 0; ndx < chunk.length; ndx++) {
      let byte = chunk[ndx]

      if (byte === this.opts.START) {
        this.start = true
        continue
      } else if (undefined == this.opts.START) {
        this.start = true
      }

      if (this.escape) {
        if (byte === this.opts.ESC_START) {
          byte = this.opts.START
        } else if (byte === this.opts.ESC_ESC) {
          byte = this.opts.ESC
        } else if (byte === this.opts.ESC_END) {
          byte = this.opts.END
        } else {
          this.escape = false
          this.push(this.buffer)
          this.buffer = Buffer.alloc(0)
        }
      } else {
        if (byte === this.opts.ESC) {
          this.escape = true
          continue
        }

        if (byte === this.opts.END) {
          this.push(this.buffer)
          this.buffer = Buffer.alloc(0)

          this.escape = false
          this.start = false
          continue
        }
      }

      this.escape = false

      if (true === this.start) {
        this.buffer = Buffer.concat([this.buffer, Buffer.from([byte])])
      }
    }

    cb()
  }

  _flush(cb) {
    this.push(this.buffer)
    this.buffer = Buffer.alloc(0)
    cb()
  }
}

module.exports = SlipDecoder
