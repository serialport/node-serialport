import { Transform, TransformCallback, TransformOptions } from 'stream'

export interface ByteLengthOptions extends TransformOptions {
  /** the number of bytes on each data event */
  length: number
}

/**
 * Emit data every number of bytes
 *
 * A transform stream that emits data as a buffer after a specific number of bytes are received. Runs in O(n) time.
 */
export class ByteLengthParser extends Transform {
  length: number
  private position: number
  private buffer: Buffer
  constructor(options: ByteLengthOptions) {
    super(options)

    if (typeof options.length !== 'number') {
      throw new TypeError('"length" is not a number')
    }

    if (options.length < 1) {
      throw new TypeError('"length" is not greater than 0')
    }

    this.length = options.length
    this.position = 0
    this.buffer = Buffer.alloc(this.length)
  }

  _transform(chunk: Buffer, _encoding: BufferEncoding, cb: TransformCallback) {
    let cursor = 0
    while (cursor < chunk.length) {
      this.buffer[this.position] = chunk[cursor]
      cursor++
      this.position++
      if (this.position === this.length) {
        this.push(this.buffer)
        this.buffer = Buffer.alloc(this.length)
        this.position = 0
      }
    }
    cb()
  }

  _flush(cb: TransformCallback) {
    this.push(this.buffer.slice(0, this.position))
    this.buffer = Buffer.alloc(this.length)
    cb()
  }
}
