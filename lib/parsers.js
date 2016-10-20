'use strict';

/**
 * The default Parsers are [Transform streams](https://nodejs.org/api/stream.html#stream_class_stream_transform) that will parse data in a variety of ways and can be used to process incoming data.

 To use any of the parsers you need to create them and then pipe the serialport to the parser. Be sure not to write to the parser but to the SerialPort object.
 * @name module:serialport.parsers
 * @type {object}
 * @property {Class} [ByteLength] is a transform stream that emits data as a buffer after a specific number of bytes are received.
 * @property {Class} [Delimiter] is a transform stream that emits data each time a byte sequence is received.
 * @property {Class} [Readline] is a transform stream that emits data after a newline delimiter is received.
 * @example
```js
var SerialPort = require('serialport');
var Readline = SerialPort.parsers.Readline;
var port = new SerialPort('/dev/tty-usbserial1');
var parser = new Readline();
port.pipe(parser);
parser.on('data', console.log);
port.write('ROBOT PLEASE RESPOND\n');

// creating the parser and piping can be shortened to
var parser = port.pipe(new Readline());
```

To use the byte length parser, you must provide the length of the number of bytes:
```js
var SerialPort = require('serialport');
var ByteLength = SerialPort.parsers.ByteLength
var port = new SerialPort('/dev/tty-usbserial1');
var parser = port.pipe(new ByteLength({length: 8}));
parser.on('data', console.log);
```

To use the Delimiter parser you must specify, you must provide a delimiter as a string, buffer, or an array of bytes:
```js
var SerialPort = require('serialport');
var Delimiter = SerialPort.parsers.Delimiter;
var port = new SerialPort('/dev/tty-usbserial1');
var parser = port.pipe(new Delimiter({delimiter: new Buffer('EOL')}));
parser.on('data', console.log);
```

To use the Readline parser, you may provide a delimiter (defaults to '\n')
```js
var SerialPort = require('serialport');
var Readline = SerialPort.parsers.Readline;
var port = new SerialPort('/dev/tty-usbserial1');
var parser = port.pipe(Readline({delimiter: '\r\n'}));
parser.on('data', console.log);
```
 */

module.exports = {
  Readline: require('./parser-readline'),
  Delimiter: require('./parser-delimiter'),
  ByteLength: require('./parser-byte-length')
};
