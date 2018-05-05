'use strict';
/**
 * Parsers are collection of transform streams to processes incoming data
 * @summary The default `Parsers` are [Transform streams](https://nodejs.org/api/stream.html#stream_class_stream_transform) that process incoming data. To use the parsers, you must create them and then pipe the Serialport to the parser. Be careful to only write to the SerialPort object and not the parser. Full documentation for parsers can be found in [their api docs](https://node-serialport.github.io/parsers/).
 * @typedef {Object} Parsers
 * @property {Transform} ByteLength
 * @property {Transform} CCtalk
 * @property {Transform} Delimiter
 * @property {Transform} Readline
 * @property {Transform} Ready
 * @property {Transform} Regex

 * @since 5.0.0
 * @example
```js
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('/dev/tty-usbserial1');
const parser = new Readline();
port.pipe(parser);
parser.on('data', console.log);
port.write('ROBOT PLEASE RESPOND\n');

// Creating the parser and piping can be shortened to
// const parser = port.pipe(new Readline());
```
 */

module.exports = {
  ByteLength: require('@serialport/parser-byte-length'),
  CCTalk: require('@serialport/parser-cctalk'),
  Delimiter: require('@serialport/parser-delimiter'),
  Readline: require('@serialport/parser-readline'),
  Ready: require('@serialport/parser-ready'),
  Regex: require('@serialport/parser-regex')
};
