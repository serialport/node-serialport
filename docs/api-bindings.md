---
id: api-bindings
title: Bindings
---

The `Binding` is how Node-SerialPort talks to the underlying system. By default, we auto detect Windows, Linux and OS X, and load the appropriate module for your system. You can assign `SerialPort.Binding` to any binding you like. Find more by searching ["serialport-binding" at npm](https://www.npmjs.com/search?q=serialport-binding).

You can prevent auto loading the default bindings by requiring the [SerialPort Stream](api-stream.md) package.
  ```js
  var SerialPort = require('@serialport/stream');
  SerialPort.Binding = MyBindingClass;
  ```

You never have to use `Binding` objects directly. `@serialPort/stream` uses them to access the underlying hardware. This documentation is geared towards people who are making bindings for different platforms. The `AbstractBinding` class from the [`@serialport/binding-abstract`](api-binding-abstract.md) package can be inherited from to get the base api.

There is also a [`MockBinding`](api-binding-mock.md) package to assist with testing.
