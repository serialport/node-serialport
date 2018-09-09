---
id: api-parsers-overview
title: What are Parsers?
---

Parsers are collection of transform streams to processes incoming data

The default `Parsers` are [Transform streams](https://nodejs.org/api/stream.html#stream_class_stream_transform) that process incoming data. To use the parsers, you must create them and then pipe the Serialport to the parser. Be careful to only write to the SerialPort object and not the parser.

## Example

```js
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = new Readline()
port.pipe(parser)
parser.on('data', console.log)
port.write('ROBOT PLEASE RESPOND\n')
```

Creating the parser and piping can be shortened to
```js
const parser = port.pipe(new Readline());
```
