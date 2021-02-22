const { Transform } = require('stream')

/**
* A transform stream that decodes packets with a delimiter and length of payload
* specified within the data stream.
* @extends Transform
* @summary Decodes packets of the general form:
*       [delimiter][len][payload0] ... [payload0 + len]
*
* The length field can be up to 4 bytes and can be at any offset within the packet
*       [delimiter][header0][header1][len0][len1[payload0] ... [payload0 + len]
*
* The offset and number of bytes of the length field need to be provided in options
* if not 1 byte immediately following the delimiter.
* @example
// Parse length encoded packets received on the serial port
const SerialPort = require('serialport')
const PacketLengthParser = require('@serialport/packet-length-parser')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new PacketLengthParser({
  delimiter: 0xbc,
  packetOverhead: 5,
  lengthBytes: 2,
  lengthOffset: 2,
}))
*/
class PacketLengthParser extends Transform {
  constructor(options = {}) {
    super(options)

    const opts = {
      delimiter: 0xaa,
      packetOverhead: 2,
      lengthBytes: 1,
      lengthOffset: 1,
      maxLen: 0xff,

      ...options,
    }
    this.opts = opts

    this.buffer = Buffer.alloc(0)
    this.start = false
  }

  _transform(chunk, encoding, cb) {
    for (let ndx = 0; ndx < chunk.length; ndx++) {
      const byte = chunk[ndx]

      if (byte === this.opts.delimiter) {
        this.start = true
      }

      if (true === this.start) {
        this.buffer = Buffer.concat([this.buffer, Buffer.from([byte])])

        if (this.buffer.length >= this.opts.lengthOffset + this.opts.lengthBytes) {
          const len = this.buffer.readUIntLE(this.opts.lengthOffset, this.opts.lengthBytes)

          if (this.buffer.length == len + this.opts.packetOverhead || len > this.opts.maxLen) {
            this.push(this.buffer)
            this.buffer = Buffer.alloc(0)
            this.start = false
          }
        }
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

module.exports = PacketLengthParser
