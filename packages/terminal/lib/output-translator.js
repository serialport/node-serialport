const { Transform } = require('stream')

/**
 * Convert carriage returns to newlines for output
 */
class OutputTranslator extends Transform {
  _transform(chunk, _encoding, cb) {
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
module.exports.OutputTranslator = OutputTranslator
