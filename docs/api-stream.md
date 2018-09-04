---
id: api-stream
title: Stream Interface
---

```js
const SerialPort = require('@serialport/stream')
```

This is the Node.js Stream Interface for SerialPort. For more information on Node.js Streams please see their [Stream API docs](https://nodejs.org/api/stream.html) and google for a large number of tutorials on Node.js streams. This stream is a Duplex Stream allowing for reading and writing. It has additional methods for managing the SerialPort connection.

You also get the stream interface by requiring the [`serialport`](api-serialport.md) package which comes with a default set of Bindings and Parsers.

```
// To get a default set of Bindings and Parsers
const SerialPort = require('serialport')
```

## `new SerialPort(path [, openOptions] [, openCallback])`

Create a new serial port object for the `path`. In the case of invalid arguments or invalid options it will throw an error. The port will open automatically by default, which is the equivalent of calling `port.open(openCallback)` in a `process.nextTick`. You can disable this by setting the option `autoOpen` to `false` in the `options`.

### `path`
`string` The system path of the serial port you want to open. For example, `/dev/tty.XXX` on Mac/Linux, or `COM1` on Windows

### `openOptions`
```js
/**
 * @typedef {Object} openOptions
 * @property {boolean} [autoOpen=true] Automatically opens the port on `nextTick`.
 * @property {number=} [baudRate=9600] The baud rate of the port to be opened. This should match one of the commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, or 115200. Custom rates are supported best effort per platform. The device connected to the serial port is not guaranteed to support the requested baud rate, even if the port itself supports that baud rate.
 * @property {number} [dataBits=8] Must be one of these: 8, 7, 6, or 5.
 * @property {number} [highWaterMark=65536] The size of the read and write buffers defaults to 64k.
 * @property {boolean} [lock=true] Prevent other processes from opening the port. Windows does not currently support `false`.
 * @property {number} [stopBits=1] Must be one of these: 1 or 2.
 * @property {string} [parity=none] Must be one of these: 'none', 'even', 'mark', 'odd', 'space'.
 * @property {boolean} [rtscts=false] flow control setting
 * @property {boolean} [xon=false] flow control setting
 * @property {boolean} [xoff=false] flow control setting
 * @property {boolean} [xany=false] flow control setting
 * @property {object=} bindingOptions sets binding-specific options
 * @property {Binding=} Binding The hardware access binding. `Bindings` are how Node-Serialport talks to the underlying system. By default we auto detect Windows (`WindowsBinding`), Linux (`LinuxBinding`) and OS X (`DarwinBinding`) and load the appropriate module for your system.
 * @property {number} [bindingOptions.vmin=1] see [`man termios`](http://linux.die.net/man/3/termios) LinuxBinding and DarwinBinding
 * @property {number} [bindingOptions.vtime=0] see [`man termios`](http://linux.die.net/man/3/termios) LinuxBinding and DarwinBinding
 */
```

### `openCallback`
```typescript
type openCallback = (Error|null) = {}
```

Called after a connection is opened. If this is not provided and an error occurs, it will be emitted on the port's `error` event. The callback will NOT be called if `autoOpen` is set to `false` in the `openOptions` as the open will not be performed.


```js
const serialport = new SerialPort('/dev/foo-bar', { autoOpen: false })
```

## `SerialPort.Binding`
## `Serialport.List`
## `SerialPort#isOpen`
## `SerialPort#binding`
## `SerialPort#baudRate`
