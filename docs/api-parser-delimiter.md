---
id: api-parser-delimiter
title: Delimiter Parser
---
```typescript
new Delimiter(options: { delimiter: string | Buffer | number[] })
```

A transform stream that emits data each time a byte sequence is received. To use the `Delimiter` parser, provide a delimiter as a string, buffer, or array of bytes. Runs in O(n) time.

Arguments
- `options.delimiter: string|Buffer|number[]` The delimiter in which to split incoming data.


```js
const SerialPort = require('serialport')
const Delimiter = require('@serialport/parser-delimiter')
const port = new SerialPort('/dev/tty-usbserial1')

const parser = port.pipe(new Delimiter({ delimiter: '\n' }))
parser.on('data', console.log) // emits data after every '\n'
```
