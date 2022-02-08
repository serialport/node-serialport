import { Transform, TransformCallback, TransformOptions } from 'stream'

export interface InterByteTimeoutOptions extends TransformOptions {
  /** the period of silence in milliseconds after which data is emitted */
  interval: number
  /** the maximum number of bytes after which data will be emitted. Defaults to 65536 */
  maxBufferSize?: number
}

/**
 * A transform stream that buffers data and emits it after not receiving any bytes for the specified amount of time or hitting a max buffer size.
 */

export class InterByteTimeoutParser extends Transform {
  maxBufferSize: number
  currentPacket: number[]
  interval: number
  intervalID: NodeJS.Timeout | undefined

  constructor({ maxBufferSize = 65536, interval, ...transformOptions }: InterByteTimeoutOptions) {
    super(transformOptions)
    if (!interval) {
      throw new TypeError('"interval" is required')
    }

    if (typeof interval !== 'number' || Number.isNaN(interval)) {
      throw new TypeError('"interval" is not a number')
    }

    if (interval < 1) {
      throw new TypeError('"interval" is not greater than 0')
    }

    if (typeof maxBufferSize !== 'number' || Number.isNaN(maxBufferSize)) {
      throw new TypeError('"maxBufferSize" is not a number')
    }

    if (maxBufferSize < 1) {
      throw new TypeError('"maxBufferSize" is not greater than 0')
    }

    this.maxBufferSize = maxBufferSize
    this.currentPacket = []
    this.interval = interval
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, cb: TransformCallback) {
    if (this.intervalID) {
      clearTimeout(this.intervalID)
    }
    for (let offset = 0; offset < chunk.length; offset++) {
      this.currentPacket.push(chunk[offset])
      if (this.currentPacket.length >= this.maxBufferSize) {
        this.emitPacket()
      }
    }
    this.intervalID = setTimeout(this.emitPacket.bind(this), this.interval)
    cb()
  }

  emitPacket() {
    if (this.intervalID) {
      clearTimeout(this.intervalID)
    }
    if (this.currentPacket.length > 0) {
      this.push(Buffer.from(this.currentPacket))
    }
    this.currentPacket = []
  }

  _flush(cb: TransformCallback) {
    this.emitPacket()
    cb()
  }
}
