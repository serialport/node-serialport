---
id: guide-cli
title: Command Line Tools
---

If you install `serialport` globally (e.g., `npm install -g serialport`), you'll receive two command line tools. These can also be run with `npx` if serialport is a dependency in your project.

For Example:
```bash
$ npm install --save serialport
$ npx serialport-list
/dev/tty.Bluetooth-Incoming-Port
/dev/tty.usbmodem1421    Arduino (www.arduino.cc)

```

## `serialport-list`
`serialport-list` will list all available serial ports in different formats.

```bash
$ serialport-list -h

  Usage: serialport-list [options]

  List available serial ports

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -f, --format <type>  Format the output as text, json, or jsonline. default: text


$ serialport-list
/dev/tty.Bluetooth-Incoming-Port
/dev/tty.usbmodem1421    Arduino (www.arduino.cc)

$ serialport-list -f json
[{"comName":"/dev/tty.Bluetooth-Incoming-Port"},{"comName":"/dev/tty.usbmodem1421","manufacturer":"Arduino (www.arduino.cc)","serialNumber":"752303138333518011C1","locationId":"14200000","vendorId":"2341","productId":"0043"}]

$ serialport-list -f jsonline
{"comName":"/dev/tty.Bluetooth-Incoming-Port"}
{"comName":"/dev/tty.usbmodem1421","manufacturer":"Arduino (www.arduino.cc)","serialNumber":"752303138333518011C1","locationId":"14200000","vendorId":"2341","productId":"0043"}
```

## `serialport-term`
`serialport-term` provides a basic terminal interface for communicating over a serial port. `ctrl+c` will exit.

```bash
$ serialport-term -h

  Usage: serialport-term -p <port> [options]

  A basic terminal interface for communicating over a serial port. Pressing ctrl+c exits.

  Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -l --list                      List available ports then exit
    -p, --port, --portname <port>  Path or name of serial port
    -b, --baud <baudrate>          Baud rate default: 9600
    --databits <databits>          Data bits default: 8
    --parity <parity>              Parity default: none
    --stopbits <bits>              Stop bits default: 1
    --echo --localecho             Print characters as you type them

$ serialport-term -l
/dev/tty.Bluetooth-Incoming-Port
/dev/tty.usbmodem1421    Arduino (www.arduino.cc)
```

## `serialport-repl`
`serialport-repl` provides a nodejs repl for working with serialport. This is valuable when debugging.

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
