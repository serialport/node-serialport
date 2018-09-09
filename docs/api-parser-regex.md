---
id: api-parser-regex
title: Regex Parser
---
```typescript
new Regex(options)
```
A transform stream that uses a regular expression to split the incoming text upon.

To use the `Regex` parser provide a regular expression to split the incoming text upon. Data is emitted as string controllable by the `encoding` option (defaults to `utf8`).

Arguments
- `options.regex: RegExp` the regular expression to use to split incoming text
- `options.encoding?: string` text encoding for the stream

```js
const SerialPort = require('serialport')
const Regex = require('@serialport/parser-regex')
const port = new SerialPort('/dev/tty-usbserial1')

const parser = port.pipe(new Regex({ regex: /[\r\n]+/ }))
parser.on('data', console.log)
```
