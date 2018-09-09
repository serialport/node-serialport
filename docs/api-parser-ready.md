---
id: api-parser-ready
title: Ready Parser
---
```typescript
new Ready(options)
```
A transform stream that waits for a sequence of "ready" bytes before emitting a ready event and emitting data events

To use the `Ready` parser provide a byte start sequence. After the bytes have been received a ready event is fired and data events are passed through.

Arguments
- `options.delimiter?: string` delimiter to use to detect the input is ready

## Example
```js
const SerialPort = require('serialport')
const Ready = require('@serialport/parser-ready')
const port = new SerialPort('/dev/tty-usbserial1')

const parser = port.pipe(new Ready({ delimiter: 'READY' }))
parser.on('ready', () => console.log('the ready byte sequence has been received'))
parser.on('data', console.log) // all data after READY is received
```
