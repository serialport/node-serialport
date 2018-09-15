---
id: api-binding-mock
title: Mock Bindings
---

```typescript
new MockBinding(options: OpenOptions)
```


Testing is an important feature of any library. To aid in our own tests we've developed a `MockBinding` a fake hardware binding that doesn't actually need any hardware to run. This class passes all of the same tests as our hardware based bindings and provides a few additional test related interfaces.

### Example

```js
const SerialPort = require('@serialport/stream')
const MockBinding = require('@serialport/binding-mock')

SerialPort.Binding = MockBinding

// Create a port and enable the echo and recording.
MockBinding.createPort('/dev/ROBOT', { echo: true, record: true })
const port = new SerialPort('/dev/ROBOT')
```

```typescript
const AbstractBinding = require('@serialport/binding-abstract')
const debug = require('debug')('serialport/binding-mock')

let ports = {}
let serialNumber = 0

function resolveNextTick(value) {
  return new Promise(resolve => process.nextTick(() => resolve(value)))
}

/**
 * Mock bindings for pretend serialport access
 */
class MockBinding extends AbstractBinding {
  // if record is true this buffer will have all data that has been written to this port
  readonly recording: Buffer

  // the buffer of the latest written data
  readonly lastWrite: null | Buffer

  // Create a mock port
  static createPort(path: string, opt: { echo?: boolean, record?: boolean, readyData?: Buffer}): void

  // Reset available mock ports
  static reset(): void

  // list mock ports
  static list(): Promise<PortInfo[]>

  // Emit data on a mock port
  emitData(data: Buffer | string | number[])

// Standard bindings interface
  open(path: string, opt: OpenOpts): Promise<void>
  close(): Promise<void>
  read(buffer: Buffer, offset: number, length: number): Promise<Buffer>
  write(buffer: Buffer): Promise<void>
  update(options: { baudRate: number }): Promise<void>
  set(options): Promise<void>
  get(): Promise<Flags>
  getBaudRate(): Promise<number>
  flush(): Promise<void>
  drain(): Promise<void>
}

```
