import { Transform } from 'stream'

/**
 * Convert carriage returns to newlines for output
 */
export class OutputTranslator extends Transform {
  _transform(chunk: Buffer, _encoding: string, cb: () => void) {
    for (let index = 0; index < chunk.length; index++) {
      const byte = chunk[index]
      if (byte === 0x0d) {
        chunk[index] = 0x0a
      }
    }
    this.push(chunk)
    cb()
  }
}
