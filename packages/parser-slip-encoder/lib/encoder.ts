import { Transform, TransformCallback, TransformOptions } from 'stream'

export interface SlipEncoderOptions extends TransformOptions {
  START?: number
  ESC?: number
  END?: number
  ESC_START?: number
  ESC_END?: number
  ESC_ESC?: number
  bluetoothQuirk?: boolean
}

/**
* A transform stream that emits SLIP-encoded data for each incoming packet.
* @extends Transform
* @summary Runs in O(n) time, adding a 0xC0 character at the end of each
* received packet and escaping characters, according to RFC 1055. Adds another
* 0xC0 character at the beginning if the `bluetoothQuirk` option is truthy (as
* per the Bluetooth Core Specification 4.0, Volume 4, Part D, Chapter 3 "SLIP Layer").
* Optionally, custom slip escape and delimiters can be provided.
* @example
// Read lines from a text file, then SLIP-encode each and send them to a serial port
const SerialPort = require('serialport')
const { SlipEncoder } = require('@serialport/parser-slip-encoder')
const Readline = require('parser-readline')
const fileReader = require('fs').createReadStream('/tmp/some-file.txt');
const port = new SerialPort('/dev/tty-usbserial1')
const lineParser = fileReader.pipe(new Readline({ delimiter: '\r\n' }));
const encoder = fileReader.pipe(new SlipEncoder({ bluetoothQuirk: false }));
encoder.pipe(port);
*/
export class SlipEncoder extends Transform {
  opts: {
    START: number | undefined
    ESC: number
    END: number
    ESC_START: number | undefined
    ESC_END: number
    ESC_ESC: number
    bluetoothQuirk: boolean
  }

  constructor(options: SlipEncoderOptions = {}) {
    super(options)

    const { START, ESC = 0xdb, END = 0xc0, ESC_START, ESC_END = 0xdc, ESC_ESC = 0xdd, bluetoothQuirk = false } = options

    this.opts = {
      START,
      ESC,
      END,
      ESC_START,
      ESC_END,
      ESC_ESC,
      bluetoothQuirk,
    }
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, cb: TransformCallback) {
    const chunkLength = chunk.length

    if (this.opts.bluetoothQuirk && chunkLength === 0) {
      // Edge case: push no data. Bluetooth-quirky SLIP parsers don't like
      // lots of 0xC0s together.
      return cb()
    }

    // Allocate memory for the worst-case scenario: all bytes are escaped,
    // plus start and end separators.
    const encoded = Buffer.alloc(chunkLength * 2 + 2)
    let j = 0

    if (this.opts.bluetoothQuirk == true) {
      encoded[j++] = this.opts.END
    }

    if (this.opts.START !== undefined) {
      encoded[j++] = this.opts.START
    }

    for (let i = 0; i < chunkLength; i++) {
      let byte = chunk[i]

      if (byte === this.opts.START && this.opts.ESC_START) {
        encoded[j++] = this.opts.ESC
        byte = this.opts.ESC_START
      } else if (byte === this.opts.END) {
        encoded[j++] = this.opts.ESC
        byte = this.opts.ESC_END
      } else if (byte === this.opts.ESC) {
        encoded[j++] = this.opts.ESC
        byte = this.opts.ESC_ESC
      }

      encoded[j++] = byte
    }

    encoded[j++] = this.opts.END

    cb(null, encoded.slice(0, j))
  }
}
