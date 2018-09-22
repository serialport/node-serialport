import { Transform } from 'stream'

/**
 * Parse the CCTalk protocol
 * @extends Transform
 * @summary A transform stream that emits CCTalk packets as they are received.
 * @example
const SerialPort = require('serialport')
const CCTalk = require('@serialport/parser-cctalk')
const port = new SerialPort('/dev/ttyUSB0')
const parser = port.pipe(new CCtalk())
parser.on('data', console.log)
 */
export class CCTalkParser extends Transform {
  // tslint:disable-next-line:readonly-keyword
  cursor: number
  // tslint:disable-next-line:readonly-keyword readonly-array
  dataBuffer: number[]
  constructor() {
    super()
    this.dataBuffer = []
    this.cursor = 0
  }

  _transform(buffer: Buffer, _: string, cb: any) {
    this.cursor += buffer.length
    // TODO: Better Faster es7 no supported by node 4
    // ES7 allows directly push [...buffer]
    // this.dataBuffer = this.dataBuffer.concat(Array.from(buffer)) //Slower ?!?
    Array.from(buffer).map(byte => this.dataBuffer.push(byte))
    while (this.cursor > 1 && this.cursor >= this.dataBuffer[1] + 5) {
      // full frame accumulated
      // copy command from the array
      const fullMsgLength = this.dataBuffer[1] + 5

      const frame = Buffer.from(this.dataBuffer.slice(0, fullMsgLength))
      // Preserve Extra Data
      this.dataBuffer = this.dataBuffer.slice(frame.length, this.dataBuffer.length)
      this.cursor -= fullMsgLength
      this.push(frame)
    }
    cb()
  }
}
