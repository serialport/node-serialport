'use strict';

/**
 * The default `Parsers` are [Transform streams](https://nodejs.org/api/stream.html#stream_class_stream_transform) that parse data in different ways to transform incoming data.

 To use the parsers, you must create them and then pipe the Serialport to the parser. Be careful to only write to the SerialPort object and not the parser.
 * @name module:serialport.parsers
 * @type {object}
 * @property {Class} [ByteLength] is a transform stream that emits data as a buffer after a specific number of bytes are received.
 * @property {Class} [Delimiter] is a transform stream that emits data each time a byte sequence is received.
 * @property {Class} [Readline] is a transform stream that emits data after a newline delimiter is received.
 * @since 5.0.0
 * @example
```js
var SerialPort = require('serialport');
var Readline = SerialPort.parsers.Readline;
var port = new SerialPort('/dev/tty-usbserial1');
var parser = new Readline();
port.pipe(parser);
parser.on('data', console.log);
port.write('ROBOT PLEASE RESPOND\n');

// Creating the parser and piping can be shortened to
var parser = port.pipe(new Readline());
```

To use the `ByteLength` parser, provide the length of the number of bytes:
```js
var SerialPort = require('serialport');
var ByteLength = SerialPort.parsers.ByteLength
var port = new SerialPort('/dev/tty-usbserial1');
var parser = port.pipe(new ByteLength({length: 8}));
parser.on('data', console.log);
```

To use the `Delimiter` parser, provide a delimiter as a string, buffer, or array of bytes:
```js
var SerialPort = require('serialport');
var Delimiter = SerialPort.parsers.Delimiter;
var port = new SerialPort('/dev/tty-usbserial1');
var parser = port.pipe(new Delimiter({delimiter: Buffer.from('EOL')}));
parser.on('data', console.log);
```

To use the `Readline` parser, provide a delimiter (defaults to '\n')
```js
var SerialPort = require('serialport');
var Readline = SerialPort.parsers.Readline;
var port = new SerialPort('/dev/tty-usbserial1');
var parser = port.pipe(Readline({delimiter: '\r\n'}));
parser.on('data', console.log);
```

To use the `Ready` parser provide a byte start sequence. After the bytes have been received data events will be passed through.
```js
var SerialPort = require('serialport');
var Ready = SerialPort.parsers.Ready;
var port = new SerialPort('/dev/tty-usbserial1');
var parser = port.pipe(Ready({data: 'READY'}));
parser.on('data', console.log); // all data after READY is received
```
 */

module.exports = {
  Readline: require('./readline'),
  Delimiter: require('./delimiter'),
  ByteLength: require('./byte-length'),
  Regex: require('./regex'),
  Ready: require('./ready')
};
