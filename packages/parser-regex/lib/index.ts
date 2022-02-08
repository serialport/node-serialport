import { Transform, TransformCallback, TransformOptions } from 'stream'

export interface RegexParserOptions extends TransformOptions {
  /** The regular expression to use to split incoming text */
  regex: RegExp | string | Buffer
  /** Defaults to utf8 */
  encoding?: BufferEncoding
}

/**
 * A transform stream that uses a regular expression to split the incoming text upon.
 *
 * To use the `Regex` parser provide a regular expression to split the incoming text upon. Data is emitted as string controllable by the `encoding` option (defaults to `utf8`).
 */
export class RegexParser extends Transform {
  regex: RegExp
  data: string

  constructor({ regex, ...options }: RegexParserOptions) {
    const opts = {
      encoding: 'utf8' as BufferEncoding,
      ...options,
    }

    if (regex === undefined) {
      throw new TypeError('"options.regex" must be a regular expression pattern or object')
    }

    if (!(regex instanceof RegExp)) {
      regex = new RegExp(regex.toString())
    }
    super(opts)

    this.regex = regex
    this.data = ''
  }

  _transform(chunk: string, encoding: BufferEncoding, cb: TransformCallback) {
    const data = this.data + chunk
    const parts = data.split(this.regex)
    this.data = parts.pop() || ''

    parts.forEach(part => {
      this.push(part)
    })
    cb()
  }

  _flush(cb: TransformCallback) {
    this.push(this.data)
    this.data = ''
    cb()
  }
}
