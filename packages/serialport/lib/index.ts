const SerialPort = require('@serialport/stream')
import { autoDetect } from '@serialport/bindings-cpp'
import { ByteLengthParser } from '@serialport/parser-byte-length'
import { CCTalkParser } from '@serialport/parser-cctalk'
import { DelimiterParser } from '@serialport/parser-delimiter'

export * from '@serialport/parser-byte-length'

/**
 * @type {AbstractBinding}
 */
SerialPort.Binding = autoDetect()

SerialPort.parsers = {
  ByteLength: ByteLengthParser,
  CCTalk: CCTalkParser,
  Delimiter: DelimiterParser,
  InterByteTimeout: require('@serialport/parser-inter-byte-timeout'),
  Readline: require('@serialport/parser-readline'),
  Ready: require('@serialport/parser-ready'),
  Regex: require('@serialport/parser-regex'),
}

export { SerialPort }
