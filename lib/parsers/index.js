'use strict';
/**
 * The default `Parsers` are [Transform streams](https://nodejs.org/api/stream.html#stream_class_stream_transform) that parse data in different ways to transform incoming data.

 To use the parsers, you must create them and then pipe the Serialport to the parser. Be careful to only write to the SerialPort object and not the parser.
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
  ByteLength: require('./byte-length'),
  CCTalk: require('./cctalk'),
  Delimiter: require('./delimiter'),
  Readline: require('./readline'),
  Ready: require('./ready'),
  Regex: require('./regex')
};
