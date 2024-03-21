import { Transform, TransformCallback, TransformOptions } from 'stream'

export interface StartEndOptions extends TransformOptions {
  /** The delimiter on which an incoming block of data is considered to start. */
  startDelimiter: string | Buffer | number[]
  /** The delimiter on which an incoming block of data is considered to end. */
  endDelimiter: string | Buffer | number[]
  /** Should the startDelimiter be included at the start of data. Defaults to `false` */
  includeStartDelimiter?: boolean
  /** Should the endDelimiter be included at the end of data. Defaults to `false` */
  includeEndDelimiter?: boolean
}

/**
 * A transform stream that emits data each time a byte sequence is received.
 * @extends Transform
 *
 * To use the `StartEnd` parser, provide the startDelimiter and endDelimiter as a strings, buffers, or arrays of bytes.
 */
export class StartEndParser extends Transform {
  startDelimiter: Buffer
  endDelimiter: Buffer
  includeStartDelimiter: boolean
  includeEndDelimiter: boolean
  buffer: Buffer

  constructor({ startDelimiter, endDelimiter, includeStartDelimiter = false, includeEndDelimiter = false, ...options }: StartEndOptions) {
    super(options)

    if (startDelimiter === undefined) {
      throw new TypeError('"startDelimiter" is not a bufferable object')
    }

    if (endDelimiter === undefined) {
      throw new TypeError('"endDelimiter" is not a bufferable object')
    }

    if (startDelimiter.length === 0) {
      throw new TypeError('"startDelimiter" has a 0 or undefined length')
    }

    if (endDelimiter.length === 0) {
      throw new TypeError('"endDelimiter" has a 0 or undefined length')
    }

    this.startDelimiter = Buffer.from(startDelimiter)
    this.endDelimiter = Buffer.from(endDelimiter)
    this.includeStartDelimiter = includeStartDelimiter
    this.includeEndDelimiter = includeEndDelimiter
    this.buffer = Buffer.alloc(0)
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, cb: TransformCallback) {
    let data = Buffer.concat([this.buffer, chunk])
    let startIndex: number
    let endIndex: number

    do {
      startIndex = data.indexOf(this.startDelimiter)
      endIndex = data.indexOf(this.endDelimiter, startIndex + this.startDelimiter.length)

      if (startIndex >= 0 && endIndex >= 0) {
        const block = data.slice(
          startIndex + (this.includeStartDelimiter ? 0 : this.startDelimiter.length),
          endIndex + (this.includeEndDelimiter ? this.endDelimiter.length : 0)
        )

        this.push(block)
        data = data.slice(endIndex + this.endDelimiter.length)
      }
    } while (startIndex >= 0 && endIndex >= 0)

    this.buffer = data
    cb()
  }

  _flush(cb: TransformCallback) {
    this.push(this.buffer)
    this.buffer = Buffer.alloc(0)
    cb()
  }
}
