# @serialport/Stream

The serialport stream interface. This package requires bindings to work.

You'd use this if you want to keep your package size down by requiring only the parts of serialport that you want to use. It is used internally in the `serialport` package.

This is how you use it.
```js

const SerialPort = require('@serialport/stream')
const { autoDetect } = require('@serialport/bindings-cpp')
SerialPort.Binding = autoDetect()
const port = new Serialport('/dev/ttyay')
```

Learn more at our [stream documentation](https://serialport.io/docs/api-stream) page.
