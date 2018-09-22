import SerialPort from '@serialport/stream'
import { Binding } from '@serialport/bindings'
import ByteLength from '@serialport/parser-byte-length'
import CCTalk from '@serialport/parser-cctalk'
import Delimiter from '@serialport/parser-delimiter'
import { ReadLineParser as Readline } from '@serialport/parser-readline'
import Ready from '@serialport/parser-ready'
import Regex from '@serialport/parser-regex'

/**
 * @type {AbstractBinding}
 */
SerialPort.Binding = Binding

/**
 * @type {Parsers}
 */
SerialPort.parsers = { ByteLength, CCTalk, Delimiter, Readline, Ready, Regex }

export default SerialPort
