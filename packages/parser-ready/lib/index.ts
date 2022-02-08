import { Transform, TransformCallback, TransformOptions } from 'stream'

export interface ReadyParserOptions extends TransformOptions {
  /** delimiter to use to detect the input is ready */
  delimiter: string | Buffer | number[]
}

/**
 * A transform stream that waits for a sequence of "ready" bytes before emitting a ready event and emitting data events
 *
 * To use the `Ready` parser provide a byte start sequence. After the bytes have been received a ready event is fired and data events are passed through.
 */
export class ReadyParser extends Transform {
  delimiter: Buffer
  readOffset: number
  ready: boolean

  constructor({ delimiter, ...options }: ReadyParserOptions) {
    if (delimiter === undefined) {
      throw new TypeError('"delimiter" is not a bufferable object')
    }

    if (delimiter.length === 0) {
      throw new TypeError('"delimiter" has a 0 or undefined length')
    }

    super(options)
    this.delimiter = Buffer.from(delimiter)
    this.readOffset = 0
    this.ready = false
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, cb: TransformCallback) {
    if (this.ready) {
      this.push(chunk)
      return cb()
    }
    const delimiter = this.delimiter
    let chunkOffset = 0
    while (this.readOffset < delimiter.length && chunkOffset < chunk.length) {
      if (delimiter[this.readOffset] === chunk[chunkOffset]) {
        this.readOffset++
      } else {
        this.readOffset = 0
      }
      chunkOffset++
    }
    if (this.readOffset === delimiter.length) {
      this.ready = true
      this.emit('ready')
      const chunkRest = chunk.slice(chunkOffset)
      if (chunkRest.length > 0) {
        this.push(chunkRest)
      }
    }
    cb()
  }
}
