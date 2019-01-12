const Transform = require('stream').Transform

/**
 * Emit data if there is no data for a specified amount of time
 * @extends Transform
 * @param {Object} options parser options object
 * @param {Number} options.interval the period of silence in milliseconds after which data is emited
 * @summary A transform stream that emits data as a buffer after a not recieving any bytes for the specified amount of time.
 * @example
const SerialPort = require('serialport')
const InterByteTimeout = require('@serialport/parser-inter-byte-timeout')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new InterByteTimeout({interval: 30}))
parser.on('data', console.log) // will emit data if there is a pause between packets graeter than 30ms
 */
class InterByteTimeoutParser extends Transform {
  constructor (options = { interval: 15 }) {
    super()

    if (Number.isNaN(options.interval)) {
      throw new TypeError('"interval" is not a number')
    }

    if (options.interval < 1) {
      console.log(options)
      throw new TypeError('"interval" is not greater than 0')
    }

    this.currentPacket = []
    this.interval = options.interval
    this.intervalID = -1
  }
  _transform (chunk, encoding, cb) {
    clearTimeout(this.intervalID)
    this.intervalID = setTimeout(this.emitPacket.bind(this), this.interval)
    for (let offset = 0; offset < chunk.length; offset++) {
      this.currentPacket.push(chunk[offset])
    }
    cb()
  }
  emitPacket () {
    this.push(Buffer.from(this.currentPacket))
    this.currentPacket = []
  }
}

module.exports = InterByteTimeoutParser
