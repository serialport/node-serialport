---
id: api-parser-cctalk
title: ccTalk Parser
---
```js
new CCTalk()
```
A transform stream that emits [ccTalk](https://en.wikipedia.org/wiki/CcTalk) packets as they are received.

## Example
```js
const SerialPort = require('serialport')
const CCTalk = require('@serialport/parser-cctalk')
const port = new SerialPort('/dev/ttyUSB0')

const parser = port.pipe(new CCtalk())
parser.on('data', console.log)
```
