## SerialPort Terminal
```bash
$ npx @serialport/terminal  -p <port> [options]
# or
$ npm install -g @serialport/terminal
$ serialport-terminal  -p <port> [options]
```

The package `@serialport/terminal` will install the `serialport-terminal` cli tool which provides a basic terminal interface for communicating over a serial port. `ctrl+c` will exit.

```bash
$ serialport-terminal -h

  Usage: serialport-terminal -p <port> [options]

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

$ serialport-terminal -l
/dev/tty.Bluetooth-Incoming-Port
/dev/tty.usbmodem1421    Arduino (www.arduino.cc)
```
