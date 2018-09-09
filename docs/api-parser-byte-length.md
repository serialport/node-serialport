---
id: api-parser-byte-length
title: ByteLength Parser
---
```typescript
new ByteLength(options)
```
Emit data every number of bytes.

A transform stream that emits data as a buffer after a specific number of bytes are received. Runs in O(n) time.

Arguments
- `options.length: number` the number of bytes to be emitted on each data event

## Example
```js
const SerialPort = require('serialport')
const ByteLength = require('@serialport/parser-byte-length')
const port = new SerialPort('/dev/tty-usbserial1')

const parser = port.pipe(new ByteLength({length: 8}))
parser.on('data', console.log) // will have 8 bytes per data event
```
