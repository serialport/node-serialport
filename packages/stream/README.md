# @serialport/stream

The serialport stream interface. This package requires bindings to work.

You'd use this if you want to keep your package size down by requiring only the parts of serialport that you want to use. It is used internally in the `serialport` package.

This is how you use it.

```ts
const { SerialPortStream } = require('@serialport/stream')
const { autoDetect } = require('@serialport/bindings-cpp')
const binding = autoDetect()
const port = new SerialPortStream({ binding, path: '/dev/ttyay', baudRate: 9600 })
```

Learn more at our [stream documentation](https://serialport.io/docs/api-stream) page.
