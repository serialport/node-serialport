const { Transform } = require('stream')

const { HEADER_LENGTH, convertHeaderBufferToObj } = require('./utils')

/**
 * A Transform stream that accepts a stream of octet data and converts it into an object
 * representation of a CCSDS Space Packet. See https://public.ccsds.org/Pubs/133x0b2e1.pdf for a
 * description of the Space Packet format.
 *
 * @extends Transform
 */
class SpacePacketParser extends Transform {
  /**
   *
   * @param {Object} options Configuration options for the stream
   * @param {Number} options.timeCodeFieldLength The length of the time code field within the data
   * @param {Number} options.ancillaryDataFieldLength The length of the ancillary data field within the data
   */
  constructor(options = {}) {
    super({ ...options, objectMode: true })
    // Set the constants for this Space Packet Connection; these will help us parse incoming data
    // fields:
    this.timeCodeFieldLength = options.timeCodeFieldLength || 0
    this.ancillaryDataFieldLength = options.ancillaryDataFieldLength || 0
    this.dataSlice = this.timeCodeFieldLength + this.ancillaryDataFieldLength
    // These are stateful based on the current packet being received:
    this.dataBuffer = Buffer.alloc(0)
    this.headerBuffer = Buffer.alloc(0)
    this.dataLength = 0
    this.expectingHeader = true
  }

  pushCompletedPacket() {
    const completedPacket = { header: { ...this.header } }
    const timeCode = Buffer.from(this.dataBuffer.slice(0, this.timeCodeFieldLength))
    const ancillaryData = Buffer.from(this.dataBuffer.slice(this.timeCodeFieldLength, this.timeCodeFieldLength + this.ancillaryDataFieldLength))
    const data = Buffer.from(this.dataBuffer.slice(this.dataSlice, this.dataLength))

    if (timeCode.length > 0 || ancillaryData.length > 0) {
      completedPacket.secondaryHeader = {}

      if (timeCode.length) {
        completedPacket.secondaryHeader.timeCode = timeCode.toString()
      }

      if (ancillaryData.length) {
        completedPacket.secondaryHeader.ancillaryData = ancillaryData.toString()
      }
    }

    completedPacket.data = data.toString()
    this.push(completedPacket)

    const nextChunk = Buffer.from(this.dataBuffer.slice(this.dataLength))

    if (nextChunk.length >= HEADER_LENGTH) {
      this.extractHeader(nextChunk)
    } else {
      this.headerBuffer = nextChunk
      this.dataBuffer = Buffer.alloc(0)
      this.expectingHeader = true
      this.dataLength = 0
      this.header = {}
    }
  }

  extractHeader(chunk) {
    const headerAsBuffer = Buffer.concat([this.headerBuffer, chunk])
    const startOfDataBuffer = headerAsBuffer.slice(HEADER_LENGTH)

    if (headerAsBuffer.length >= HEADER_LENGTH) {
      this.header = convertHeaderBufferToObj(headerAsBuffer)
      this.dataLength = this.header.dataLength
      this.headerBuffer = Buffer.alloc(0)
      this.expectingHeader = false
    } else {
      this.headerBuffer = headerAsBuffer
    }

    if (startOfDataBuffer.length > 0) {
      this.dataBuffer = Buffer.from(startOfDataBuffer)

      if (this.dataBuffer.length >= this.dataLength) {
        this.pushCompletedPacket()
      }
    }
  }

  _transform(chunk, _, cb) {
    if (this.expectingHeader) {
      this.extractHeader(chunk)
    } else {
      this.dataBuffer = Buffer.concat([this.dataBuffer, chunk])

      if (this.dataBuffer.length >= this.dataLength) {
        this.pushCompletedPacket()
      }
    }

    cb()
  }

  _flush(cb) {
    const remaining = Buffer.concat([this.headerBuffer, this.dataBuffer])
    const remainingArray = Array.from(remaining)

    this.push(remainingArray)
    cb()
  }
}

module.exports = SpacePacketParser
