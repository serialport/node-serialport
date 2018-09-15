---
id: guide-testing
title: Testing
---

Testing is an important feature of any library. To aid in our own tests we've developed a [`MockBinding`](api-binding-mock.md) a fake hardware binding that doesn't actually need any hardware to run. This class passes all of the same tests as our hardware based bindings and provides a few additional test related interfaces.

```js
const SerialPort = require('@serialport/stream')
const MockBinding = require('@serialport/binding-mock')

SerialPort.Binding = MockBinding

// Create a port and enable the echo and recording.
MockBinding.createPort('/dev/ROBOT', { echo: true, record: true })
const port = new SerialPort('/dev/ROBOT')
```

The code can be found in the [`@serialport/binding-mock`](api-binding-mock.md) package.
