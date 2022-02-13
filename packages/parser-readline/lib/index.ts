import { DelimiterParser } from '@serialport/parser-delimiter'
import { TransformOptions } from 'stream'

export interface ReadlineOptions extends TransformOptions {
  /** delimiter to use defaults to \n */
  delimiter?: string | Buffer | number[]
  /** include the delimiter at the end of the packet defaults to false */
  includeDelimiter?: boolean
  /** Defaults to utf8 */
  encoding?: BufferEncoding
}

/**
 *  A transform stream that emits data after a newline delimiter is received.
 * @summary To use the `Readline` parser, provide a delimiter (defaults to `\n`). Data is emitted as string controllable by the `encoding` option (defaults to `utf8`).
 */
export class ReadlineParser extends DelimiterParser {
  constructor(options?: ReadlineOptions) {
    const opts = {
      delimiter: Buffer.from('\n', 'utf8'),
      encoding: 'utf8' as BufferEncoding,
      ...options,
    }

    if (typeof opts.delimiter === 'string') {
      opts.delimiter = Buffer.from(opts.delimiter, opts.encoding)
    }

    super(opts)
  }
}
