## SerialPort List

```bash
$ npx @serialport/list [options]
# or
$ npm install -g @serialport/list
$ serialport-list [options]
```

The package `@serialport/list` will install the `serialport-list` cli tool which lists all available serial ports in different formats.

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
