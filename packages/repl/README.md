## SerialPort Repl
```bash
$ npx @serialport/repl <port>
# or
$ npm install -g @serialport/repl
$ serialport-repl <port>
```

The package `@serialport/repl` will install the `serialport-repl` cli tool which provides a nodejs repl for working with serialport. This is valuable when debugging.

You can make use of the `serialport-repl` command with;
```bash
$ serialport-repl # to auto detect an arduino
$ serialport-repl /dev/tty.usbmodem1421 # to connect to a specific port
```

It will load a serialport object with debugging turned on.
```bash
$ serialport-repl
  serialport:binding:auto-detect loading DarwinBinding +0ms
port = SerialPort("/dev/tty.usbmodem1421", { autoOpen: false })
globals { SerialPort, portName, port }
> SerialPort.list()
  serialport:main .list +6s
[ { comName: '/dev/tty.usbmodem1421',
    manufacturer: 'Arduino (www.arduino.cc)',
    serialNumber: '752303138333518011C1',
    pnpId: undefined,
    locationId: '14200000',
    vendorId: '2341',
    productId: '0043' } ]
> port.write('Calling all Autobots!')
true
> port.read()
  serialport:main _read queueing _read for after open +1m
null
> port.open()
  serialport:main opening path: /dev/tty.usbmodem1421 +30s
  serialport:bindings open +1ms
```
