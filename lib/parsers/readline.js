'use strict';
const Buffer = require('safe-buffer').Buffer;
const DelimiterParser = require('./delimiter');
/**
 *  A transform stream that emits data after a newline delimiter is received.
 * @extends DelimiterParser
 * @example
To use the `Readline` parser, provide a delimiter (defaults to '\n'). Data is emitted as string controllable by the `encoding` option (defaults to `utf8`).
```js
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('/dev/tty-usbserial1');
const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
parser.on('data', console.log);
```
*/
class ReadLineParser extends DelimiterParser {
  constructor(options) {
    const opts = Object.assign({
      delimiter: Buffer.from('\n', 'utf8'),
      encoding: 'utf8'
    }, options);

    if (typeof opts.delimiter === 'string') {
      opts.delimiter = Buffer.from(opts.delimiter, opts.encoding);
    }

    super(opts);
  }
};

module.exports = ReadLineParser;
