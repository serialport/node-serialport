---
title: Packet Delimiter Length Parser
---
```typescript
new PacketLengthParser((options?)
```
A transform stream that emits data after a delimiter and number of bytes is received.  The length in bytes of the packet follows the delimiter at a specified byte offset. To use the `PacketLength` parser, provide a delimiter (defaults to 0xaa), packetOverhead (defaults to 2), number of length bytes (defaults to 1) and the lengthOffset (defaults to 1). Data is emitted as a buffer.

Arguments
- `options.delimiter?: UInt8` delimiter to use
- `options.packetOverhead?: UInt8` overhead of packet (including length, delimiter and any checksum / packet footer)
- `options.lengthBytes?: UInt8` number of bytes containing length
- `options.lengthOffset?: UInt8` offset of length field
- `options.maxLen?: UInt8` maximum valid length for a packet

## Example
```js
// Parse length encoded packets received on the serial port in the form:
// [delimiter][0][len 0][len 1][cargo 0]...[cargo n][footer 0]
const SerialPort = require('serialport')
const PacketLengthParser = require('@serialport/packet-length-parser')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new PacketLengthParser({
  delimiter: 0xbc,
  packetOverhead: 5,
  lengthBytes: 2,
  lengthOffset: 2,
}))
