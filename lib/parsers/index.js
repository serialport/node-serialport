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

To use the `ByteLength` parser, provide the length of the number of bytes:
```js
const SerialPort = require('serialport');
const ByteLength = SerialPort.parsers.ByteLength
const port = new SerialPort('/dev/tty-usbserial1');
const parser = port.pipe(new ByteLength({length: 8}));
parser.on('data', console.log);
```

To use the `Delimiter` parser, provide a delimiter as a string, buffer, or array of bytes:
```js
const SerialPort = require('serialport');
const Delimiter = SerialPort.parsers.Delimiter;
const port = new SerialPort('/dev/tty-usbserial1');
const parser = port.pipe(new Delimiter({ delimiter: Buffer.from('EOL') }));
parser.on('data', console.log);
```

To use the `Readline` parser, provide a delimiter (defaults to '\n'). Data is emitted as string controllable by the `encoding` option (defaults to `utf8`).
```js
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('/dev/tty-usbserial1');
const parser = port.pipe(Readline({ delimiter: '\r\n' }));
parser.on('data', console.log);
```

To use the `Ready` parser provide a byte start sequence. After the bytes have been received data events are passed through.
```js
const SerialPort = require('serialport');
const Ready = SerialPort.parsers.Ready;
const port = new SerialPort('/dev/tty-usbserial1');
const parser = port.pipe(Ready({ data: 'READY' }));
parser.on('ready', () => console.log('the ready byte sequence has been received'))
parser.on('data', console.log); // all data after READY is received
```

To use the `Regex` parser provide a regular expression to split the incoming text upon. Data is emitted as string controllable by the `encoding` option (defaults to `utf8`).
```js
const SerialPort = require('serialport');
const Regex = SerialPort.parsers.Regex;
const port = new SerialPort('/dev/tty-usbserial1');
const parser = port.pipe(Regex({ regex: /[\r\n]+/ }));
parser.on('data', console.log);
```
 */

module.exports = {
  ByteLength: require('./byte-length'),
  Delimiter: require('./delimiter'),
  Readline: require('./readline'),
  Ready: require('./ready'),
  Regex: require('./regex')
};
