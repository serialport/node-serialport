import { Transform, TransformCallback } from 'stream'

/**
 * Parse the CCTalk protocol
 * @extends Transform
 *
 * A transform stream that emits CCTalk packets as they are received.
 */
export class CCTalkParser extends Transform {
  array: number[]
  cursor: number
  lastByteFetchTime: number
  maxDelayBetweenBytesMs: number

  constructor(maxDelayBetweenBytesMs = 50) {
    super()
    this.array = []
    this.cursor = 0
    this.lastByteFetchTime = 0
    this.maxDelayBetweenBytesMs = maxDelayBetweenBytesMs
  }

  _transform(buffer: Buffer, encoding: BufferEncoding, cb: TransformCallback) {
    if (this.maxDelayBetweenBytesMs > 0) {
      const now = Date.now()
      if (now - this.lastByteFetchTime > this.maxDelayBetweenBytesMs) {
        this.array = []
        this.cursor = 0
      }
      this.lastByteFetchTime = now
    }

    this.cursor += buffer.length
    // TODO: Better Faster es7 no supported by node 4
    // ES7 allows directly push [...buffer]
    // this.array = this.array.concat(Array.from(buffer)) //Slower ?!?
    Array.from(buffer).map(byte => this.array.push(byte))
    while (this.cursor > 1 && this.cursor >= this.array[1] + 5) {
      // full frame accumulated
      // copy command from the array
      const FullMsgLength = this.array[1] + 5

      const frame = Buffer.from(this.array.slice(0, FullMsgLength))
      // Preserve Extra Data
      this.array = this.array.slice(frame.length, this.array.length)
      this.cursor -= FullMsgLength
      this.push(frame)
    }
    cb()
  }
}
