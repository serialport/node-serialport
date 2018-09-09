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

## Constructor
```js
new SerialPort(path [, openOptions] [, openCallback])
```

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
 * @property {Binding=} Binding The hardware access binding. `Bindings` are how Node-Serialport talks to the underlying system. Will default to the static property `Serialport.Binding`.
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

## Static Properties

### `SerialPort.Binding`
```typescript
SerialPort.Binding: Binding
```

The hardware access binding. `Bindings` are how Node-Serialport talks to the underlying system. This static property is used to set the default binding for any new port created with this constructor. It is also used for `Serialport.list`.

If you're using the `serialport` package this defaults to `require('@serialport/bindings')`.

## Static Methods

### `Serialport.list()`
```typescript
Serialport.list(): Promise<PortInfo[]>
```
Retrieves a list of available serial ports with metadata. Only the `comName` is guaranteed. If unavailable the other fields will be undefined. The `comName` is either the path or an identifier (eg `COM1`) used to open the SerialPort.

The `SerialPort` class delegates this function to the provided `Binding` on [`SerialPort.Binding`](#serialportbinding-binding).

We make an effort to identify the hardware attached and have consistent results between systems. Linux and OS X are mostly consistent. Windows relies on 3rd party device drivers for the information and is unable to guarantee the information. On windows If you have a USB connected device can we provide a serial number otherwise it will be `undefined`. The `pnpId` and `locationId` are not the same or present on all systems. The examples below were run with the same Arduino Uno.

```js
// OSX example port
{
  comName: '/dev/tty.usbmodem1421',
  manufacturer: 'Arduino (www.arduino.cc)',
  serialNumber: '752303138333518011C1',
  pnpId: undefined,
  locationId: '14500000',
  productId: '0043',
  vendorId: '2341'
}

// Linux example port
{
  comName: '/dev/ttyACM0',
  manufacturer: 'Arduino (www.arduino.cc)',
  serialNumber: '752303138333518011C1',
  pnpId: 'usb-Arduino__www.arduino.cc__0043_752303138333518011C1-if00',
  locationId: undefined,
  productId: '0043',
  vendorId: '2341'
}

// Windows example port
{
  comName: 'COM3',
  manufacturer: 'Arduino LLC (www.arduino.cc)',
  serialNumber: '752303138333518011C1',
  pnpId: 'USB\\VID_2341&PID_0043\\752303138333518011C1',
  locationId: 'Port_#0003.Hub_#0001',
  productId: '0043',
  vendorId: '2341'
}
```

```js
var SerialPort = require('serialport')
SerialPort.list().then(
  ports => posts.forEach(console.log),
  err => console.error(err)
)
```

## Properties
A `SerialPort` object has several properties.

### `SerialPort#baudRate`
```typescript
serialport.baudRate: number
```
The port's baudRate. Use `#update()` to change it. Read-only

### `SerialPort#binding`
```typescript
serialport.binding: Binding
```
The `Binding` object backing the port. Read-only.

### `SerialPort#isOpen`
```typescript
serialport.isOpen: Boolean
```
`true` if the port is open, `false` otherwise. Read-only. (`since 5.0.0`)

### `SerialPort#path`
```typescript
serialport.path: string
```
The path of the serial port. Read-only.

## Events
A SerialPort Stream object is a [Node.js transform stream](https://nodejs.org/api/stream.html) and implements the standard `data` and `error` events in addition to a few others.

### `open`
The `open` event happens when the port is opened and ready for writing. This happens if you have the constructor open immediately (which opens in the next tick) or if you open the port manually with `open()`. See [Usage/Auto Open](guide-usage.md#auto-open) for more information.

### `error`
The `error` provides an error object whenever there is an unhandled error. You can usually handle an error with a callback to the method that produced it.

### `close`
The `close` event's is emitted when the port is closed. In the case of a disconnect it will be called with a Disconnect Error object (`err.disconnected == true`). In the event of a close error (unlikely), an error event is triggered.

### `data`
Listening for the `data` event puts the port in flowing mode. Data is emitted as soon as it's received. Data is a `Buffer` object with any amount of data in it. It's only guaranteed to have at least one byte. See the [parsers](api-parsers-overview.md) section for more information on how to work with the data, and the [Node.js stream documentation](https://nodejs.org/api/stream.html#stream_event_data) for more information on the data event.

### `drain`
The `drain` event is emitted when it is performant to write again if a `write()` call has returned `false`. For more info see the [Node.js `drain` documentation](https://nodejs.org/api/stream.html#stream_event_drain) for more info.

## Methods

### `SerialPort#open`
```js
serialport.open(() => {}): void
```

Opens the connection of the given serial port. Emits an [`open`](api-stream.md#open) event when the port is open.

### `SerialPort#update`
```js
serialport.update(options: updateOptions, callback?: err => {}): void
```
Changes the baud rate for an open port. Throws if you provide a bad argument. Emits an error or calls the callback if the baud rate isn't supported.

> `updateOptions.baudRate: number` The baud rate of the port to be opened. This should match one of the commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, or 115200. Custom rates are supported best effort per platform. The device connected to the serial port is not guaranteed to support the requested baud rate, even if the port itself supports that baud rate.

> `callback: error => {}: void` Called once the port's baud rate changes. If `.update` is called without a callback, and there is an error, an error event is emitted.

### `SerialPort#write`
```js
serialport.write(data: string|Buffer|Array<number>, encoding?: string, callback?: error => {}): boolean
```

Writes data to the given serial port. Buffers written data if the port is not open and writes it after the port opens. The write operation is non-blocking. When it returns, data might still not have been written to the serial port. See `drain()`.

> Some devices, like the Arduino, reset when you open a connection to them. In such cases, immediately writing to the device will cause lost data as they wont be ready to receive the data. This is often worked around by having the Arduino send a "ready" byte that your Node program waits for before writing. You can also often get away with waiting around 400ms. See the `ReadyParser` for a solution to this.

If a port is disconnected during a write, the write will error in addition to the `close` event.

From the [stream docs](https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback) write errors don't always provide the error in the callback, sometimes they use the error event.
> If an error occurs, the callback may or may not be called with the error as its first argument. To reliably detect write errors, add a listener for the 'error' event.

While this is in the stream docs, this hasn't been observed.

In addition to the usual `stream.write` arguments (`String` and `Buffer`), `write()` can accept arrays of bytes (positive numbers under 256) which is passed to `Buffer.from([])` for conversion. This extra functionality is pretty sweet.

Arguments:

- `data: string|Buffer|Array<number>`
- `encoding?: string` The encoding, if chunk is a string. Defaults to `'utf8'`. Also accepts `'ascii'`, `'base64'`, `'binary'`, and `'hex'` See [Buffers and Character Encodings](https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings) for all available options.
- `callback?: error => {}` Called once the write operation finishes. Data may not yet be drained to the underlying port.

Returns a boolean `false` if the stream wishes for the calling code to wait for the `drain` event to be emitted before continuing to write additional data; otherwise `true`.

### `SerialPort#read`
```js
serialport.read(size?: number): string|Buffer|null
```

Request a number of bytes from the SerialPort. The `read()` method pulls some data out of the internal buffer and returns it. If no data is available to be read, null is returned. By default, the data is returned as a `Buffer` object unless an encoding has been specified using the `.setEncoding()` method.

Arguments:
- `size?: number` Specify how many bytes of data to return, if available

### `SerialPort#close`
```js
serialport.close(callback?: error => {}): void
```
Closes an open connection. If there are in progress writes when the port is closed the writes will error.

Arguments:
- `callback?: (error => {}: void) Called once a connection is closed.

### `Serialport#set`
```typescript
serialport.set(options: setOptions, callback?: error => {}): void
```
Set control flags on an open port. Uses [`SetCommMask`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363257(v=vs.85).aspx) for Windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for OS X and Linux.

Arguments:
- `options: setOptions` All options are operating system default when the port is opened. Every flag is set on each call to the provided or default values. If options isn't provided default options are used.
- `callback: error => {}` Called once the port's flags have been set.

`setOptions`
```js
/**
 * {Boolean} [setOptions.brk=false] sets the brk flag
 * {Boolean} [setOptions.cts=false] sets the cts flag
 * {Boolean} [setOptions.dsr=false] sets the dsr flag
 * {Boolean} [setOptions.dtr=true] sets the dtr flag
 * {Boolean} [setOptions.rts=true] sets the rts flag
 */
```

### `SerialPort#get`
```typescript
serialport.get(callback: (error, data: ModemStatus) => {}): void
```

Returns the control flags (CTS, DSR, DCD) on the open port. Uses [`GetCommModemStatus`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363258(v=vs.85).aspx) for Windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for mac and linux.

```js
/*
 * {boolean} [ModemStatus.cts=false]
 * {boolean} [ModemStatus.dsr=false]
 * {boolean} [ModemStatus.dcd=false]
 */
```


### `SerialPort#flush`
```typescript
serialport.flush(callback? error => {}):void
```
Flush discards data received but not read, and written but not transmitted by the operating system. For more technical details, see [`tcflush(fd, TCIOFLUSH)`](http://linux.die.net/man/3/tcflush) for Mac/Linux and [`FlushFileBuffers`](http://msdn.microsoft.com/en-us/library/windows/desktop/aa364439) for Windows.

- `callback? error => {}` Called once the flush operation finishes.


### `SerialPort#drain`
```typescript
serialport.drain(callback? error => {}):void
```
Waits until all output data is transmitted to the serial port. After any pending write has completed it calls [`tcdrain()`](http://linux.die.net/man/3/tcdrain) or [FlushFileBuffers()](https://msdn.microsoft.com/en-us/library/windows/desktop/aa364439(v=vs.85).aspx) to ensure it has been written to the device.

- `callback? error => {}` Called once the drain operation returns.

#### Drain Example
A function to write `data` and wait until it has finished transmitting to the target serial port before calling the callback. This will wait until the port is open and writes are finished as determined by the operating system.

```js
function writeAndDrain (data, callback) {
  port.write(data)
  port.drain(callback)
}
```

### `SerialPort#pause`
```js
serialport.pause(): this
```
The `pause()` method causes a stream in flowing mode to stop emitting 'data' events, switching out of flowing mode. Any data that becomes available remains in the internal buffer.

### `SerialPort#resume`
```js
serialport.resume(): this
```
The `resume()` method causes an explicitly paused, `Readable` stream to resume emitting 'data' events, switching the stream into flowing mode.
