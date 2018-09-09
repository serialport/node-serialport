---
id: api-serialport
title: SerialPort
---

```js
const SerialPort = require('serialport')
```

This package provides everything you need to start talking over your serialport. It provides a high level [Stream Interface](api-stream.md), auto detecting [bindings](api-bindings.md), and a set of [parser streams](#serialportparsers).

> Most of the api is covered in the [Stream Interface](api-stream.md) docs.

Historically this was the only package involved and it contained everything. Since version 7 the internals have been split into their own modules and be required separately allowing a user to only install what they require.

This allows for smaller installs and alternative interfaces, bindings and parsers.

## `SerialPort`

This is the [Stream Interface](api-stream.md) constructor. It comes pre-populated with `Binding` and `Parsers`

```js
const serialport = new SerialPort(path)
serialport.write('ROBOT POWER ON')
```


## `SerialPort.Binding`

This package includes the [`@serialport/bindings`](api-bindings.md) package already attached to the stream interface.

```js
SerialPort.Binding = require('@serialport/bindings)
```

## `SerialPort.parsers`

Comes with the following parsers available for use.

- [ByteLength](api-parser-byte-length.md)
- [CCTalk](api-parser-cctalk.md)
- [Delimiter](api-parser-delimiter.md)
- [Readline](api-parser-readline.md)
- [Ready](api-parser-ready.md)
- [Regex](api-parser-regex.md)

```js
SerialPort.parsers = {
  ByteLength: require('@serialport/parser-byte-length'),
  CCTalk: require('@serialport/parser-cctalk'),
  Delimiter: require('@serialport/parser-delimiter'),
  Readline: require('@serialport/parser-readline'),
  Ready: require('@serialport/parser-ready'),
  Regex: require('@serialport/parser-regex'),
}
```
These `Parsers` are all [Transform streams](https://nodejs.org/api/stream.html#stream_class_stream_transform) that process incoming data. To use the parsers, you must create them and then pipe the Serialport to the parser. Be careful to only write to the SerialPort object and not the parser.

```js
const SerialPort = require('serialport')
const Readline = SerialPort.parsers.Readline
const port = new SerialPort(path)
const parser = new Readline()
port.pipe(parser)
parser.on('data', console.log)
port.write('ROBOT PLEASE RESPOND\n')
// ROBOT ONLINE

// Creating the parser and piping can be shortened to
const parser = port.pipe(new Readline())
```
