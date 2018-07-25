# @serialport/Stream

The serialport stream interface. This package requires bindings to work.

You'd use this if you want to keep your package size down by requiring only the parts of serialport that you want to use. It is used internally in the `serialport` package.

This is how you use it.
```js

const SerialPort = require('@serialport/stream')
const Binding = require('@serialport/bindings')
SerialPort.Binding = Binding
const port = new Serialport('/dev/ttyay')
```
