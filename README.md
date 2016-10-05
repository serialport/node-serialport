# Node Serialport

[![npm](https://img.shields.io/npm/dm/serialport.svg?maxAge=2592000)](http://npmjs.com/package/serialport)
[![Gitter chat](https://badges.gitter.im/EmergingTechnologyAdvisors/node-serialport.svg)](https://gitter.im/EmergingTechnologyAdvisors/node-serialport)
[![Dependency Status](https://david-dm.org/EmergingTechnologyAdvisors/node-serialport.svg)](https://david-dm.org/EmergingTechnologyAdvisors/node-serialport)
[![Build Status](https://travis-ci.org/EmergingTechnologyAdvisors/node-serialport.svg?branch=master)](https://travis-ci.org/EmergingTechnologyAdvisors/node-serialport)
[![Build status](https://ci.appveyor.com/api/projects/status/u6xe3iao2crd7akn/branch/master?svg=true)](https://ci.appveyor.com/project/j5js/node-serialport/branch/master)
[![Coverage Status](https://coveralls.io/repos/github/EmergingTechnologyAdvisors/node-serialport/badge.svg?branch=master)](https://coveralls.io/github/EmergingTechnologyAdvisors/node-serialport?branch=master)

For support you can open a [github issue](https://github.com/EmergingTechnologyAdvisors/node-serialport/issues/new), for discussions, designs, and clarifications, we recommend you join our [Gitter Chat room](https://gitter.im/EmergingTechnologyAdvisors/node-serialport). We have two related projects [Browser Serialport](https://github.com/garrows/browser-serialport) "just like Node Serialport but for browser apps", and [Serialport Test Piliot](https://github.com/j5js/serialport-test-pilot) which helps us test serialport.

If you'd like to contribute please take a look at [contribution guide](CONTRIBUTING.md) and [code of conduct](CODE_OF_CONDUCT.md). You also might want to see the [road map](https://github.com/EmergingTechnologyAdvisors/node-serialport/issues/746). We also have issues tagged ["good first PR"](https://github.com/EmergingTechnologyAdvisors/node-serialport/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+pr%22) if you'd like to start somewhere specific. We'll do our best to support you until your PR is merged.

***

# Which version of Serialport would you like documentation for?

You're reading the README for the master branch of serialport. You probably want to be looking at the README of our latest release. See our [change log](changelog.md) for what's new and our [upgrade guide](UPGRADE_GUIDE.md) for a walk through on what to look out for between major versions.

 - [`serialport@4.0.2` docs are here](https://github.com/EmergingTechnologyAdvisors/node-serialport/blob/4.0.1/README.md) it is the latest `4.x` releases.
 - [`serialport@3.1.2` docs are here](https://github.com/EmergingTechnologyAdvisors/node-serialport/blob/3.1.2/README.md) it is the latest `3.x` releases.
 - [`serialport@2.1.2` docs are here](https://github.com/EmergingTechnologyAdvisors/node-serialport/blob/2.1.2/README.md) it was the last `2.x` release
 - [`serialport@1.7.4` docs are here](https://github.com/EmergingTechnologyAdvisors/node-serialport/blob/v1.7.4/README.md) it was the last `1.x` release

***

Imagine a world where you can write JavaScript to control blenders, lights, security systems, or even robots. Yes, I said robots. That world is here and now with node serialport. It provides a very simple interface to the low level serial port code necessary to program [Arduino](http://www.arduino.cc/) chipsets, [X10](http://www.smarthome.com/manuals/protocol.txt) wireless communications, or even the rising [Z-Wave](http://www.z-wave.com/modules/ZwaveStart/) and [Zigbee](http://www.zigbee.org/) standards. The physical world is your oyster with this goodie. For a full break down of why we made this, please read [NodeBots - The Rise of JS Robotics](http://www.voodootikigod.com/nodebots-the-rise-of-js-robotics).

***

For getting started with node-serialport, we recommend you begin with the following articles:
* [Johnny-Five](http://johnny-five.io/#hello-world) - The Johnny-Five Robotics and IoT platform's 6 line "Hello World" (awesome).
* [Arduino Node Security Sensor Hacking](http://nexxylove.tumblr.com/post/20159263403/arduino-node-security-sensor-hacking) - A great all around "how do I use this" article.
* [NodeBots - The Rise of JS Robotics](http://www.voodootikigod.com/nodebots-the-rise-of-js-robotics) - A survey article of why one would want to program robots in JS and how this all started.

***

* [Platform Support](#platform-support)
* [Installation](#installation-instructions)
* [Installation Special Cases](#installation-special-cases)
  * [Windows](#windows)
  * [Mac OS X](#mac-os-x)
  * [Ubuntu/Debian Linux](#ubuntudebian-linux)
  * [Alpine Linux](#alpine-linux)
  * [Raspberry Pi Linux](#raspberry-pi-linux)
  * [Illegal Instruction](#illegal-instruction)
* [Usage](#usage)
  * [Opening a Port](#opening-a-port)
  * [Listing Ports](#listing-ports)
  * [Parsers](#parsers)
* [Methods](#methods)
  * [SerialPort](#serialport-path-options-opencallback)
  * [close()](#close-callback)
  * [drain()](#drain-callback)
  * [flush()](#flush-callback)
  * [isOpen()](#isopen)
  * [open()](#open-callback)
  * [pause()](#pause-)
  * [resume()](#resume-)
  * [set()](#set-options-callback)
  * [update()](#update-options-callback)
  * [write()](#write-buffer-callback)
* [Events](#events)
* [Command Line Tools](#command-line-tools)
  * [Serial Port List](#serial-port-list)
  * [Serial Port Terminal](#serial-port-terminal)

***

## Platform Support
`serialport` supports and tests against the following platforms, architectures and node versions.

| Platform / Arch | Node v0.10.x | Node v0.12.x | Node v4.x | Node v5.x | Node v6.x |
|       ---       | --- | --- | --- | --- | --- |
| Linux / ia32    |  ☑  |  ☑  |  ☑  |  ☑  |  ☑  |
| Linux / x64     |  ☑  |  ☑  |  ☑  |  ☑  |  ☑  |
| Linux / ARM v6¹ |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |
| Linux / ARM v7¹ |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |
| Linux / ARM v8¹ |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |
| Linux / MIPSel¹ |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |
| Linux / PPC64¹  |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |
| Windows² / x86  |  ☑  |  ☑  |  ☑  |  ☑  |  ☑  |
| Windows² / x64  |  ☑  |  ☑  |  ☑  |  ☑  |  ☑  |
| OSX³ / x64      |  ☑  |  ☑  |  ☑  |  ☑  |  ☑  |

¹ ARM, MIPSel and PPC64¹ platforms are known to work but are not currently part of our test or build matrix. [#846](https://github.com/EmergingTechnologyAdvisors/node-serialport/issues/846) ARM v4 and v5 was dropped from NodeJS after Node v0.10.

² Windows 7, 8, 10, and 10 IoT are supported but only Windows Server 2012 R2 is tested by our CI.

³ OSX 10.4 Tiger and above are supported but only 10.9.5 Mavericks with Xcode 6.1 is tested in our CI.

## Installation Instructions

For most "standard" use cases (node v4.x on mac, linux, windows on a x86 or x64 processor), node-serialport will install nice and easy with a simple

```
npm install serialport
```

### Installation Special Cases

We are using [node-pre-gyp](https://github.com/mapbox/node-pre-gyp) to compile and post binaries of the library for most common use cases (linux, mac, windows on standard processor platforms). If you are on a special case, node-serialport will work, but it will compile the binary when you install.

This assumes you have everything on your system necessary to compile ANY native module for Node.js. This may not be the case, though, so please ensure the following are true for your system before filing an issue about "Does not install". For all operatings systems, please ensure you have Python 2.x installed AND not 3.0, node-gyp (what we use to compile) requires Python 2.x.

#### Windows

 * Windows 7, Windows 8.1, and Windows 10 are supported.
 * Might just download and install with no extra steps. If the downloaded binary fails you'll have to build it with the following steps.
 * Install [Visual Studio Express 2013 for Windows Desktop](http://www.microsoft.com/visualstudio/eng/2013-downloads#d-2013-express).
 * If you are hacking on an Arduino, be sure to install [the drivers](http://arduino.cc/en/Guide/windows#toc4).
 * Install [node.js](http://nodejs.org/) matching the bitness (32 or 64) of your operating system.
 * Install [Python 2.7.6](http://www.python.org/download/releases/2.7.6/) matching the bitness of your operating system.  For any questions, please refer to their [FAQ](http://docs.python.org/2/faq/windows.html). Default settings are perfect.
 * Open the 'Visual Studio Command Prompt' and add Python to the path.

#### Mac OS X

Ensure that you have at a minimum the xCode Command Line Tools installed appropriate for your system configuration. If you recently upgraded the OS, it probably removed your installation of Command Line Tools, please verify before submitting a ticket. To compile `node-serialport` with Node.js 4.x+, you will need to use g++ v4.8 or higher.

#### Ubuntu/Debian Linux

The best way to install any version of NodeJS is to use the [NodeSource Node.js Binary Distributions](https://github.com/nodesource/distributions#installation-instructions). Older versions of Ubuntu install nodejs with the wrong version and binary name. If you node binary is `nodejs` not `node` or if your node version is [`v0.10.29`](https://github.com/fivdi/onoff/wiki/Node.js-v0.10.29-and-native-addons-on-the-Raspberry-Pi) then you should follow these instructions.

The package `build-essential` is necessary to compile `serialport`. If there's a binary for your platform you won't need it. Keep rocking!


```
# Using Ubuntu and node 6
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs

# Using Debian and node 6, as root
curl -sL https://deb.nodesource.com/setup_6.x | bash -
apt-get install -y nodejs
```

#### Alpine Linux

[Alpine](http://www.alpinelinux.org/) is a (very) small distro, but it uses the musl standard library instead of glibc (that most other Linux distros use), so it requires compilation.

```
# If you don't have node/npm already, add that first
sudo apk add --no-cache nodejs

# Add the necessary build and runtime dependencies
sudo apk add --no-cache make gcc g++ python linux-headers udev

# Then we can install serialport, forcing it to compile
npm install serialport --build-from-source=serialport
```

#### Raspberry Pi Linux

Follow the instructions for [setting up a Raspberry pi for use with Johnny-Five and Raspi IO](https://github.com/nebrius/raspi-io/wiki/Getting-a-Raspberry-Pi-ready-for-NodeBots). These projects use Node Serialport under the hood.

| Revision       |      CPU              | Arm Version |
|   ----         |      ---              |     ---     |
| A, A+, B, B+   | 32-bit ARM1176JZF-S   |    ARMv6    |
| Compute Module | 32-bit ARM1176JZF-S   |    ARMv6    |
| Zero           | 32-bit ARM1176JZF-S   |    ARMv6    |
| B2             | 32-bit ARM Cortex-A7  |    ARMv7    |
| B3             | 32-bit ARM Cortex-A53 |    ARMv8    |


#### Illegal Instruction

The pre-compiled binaries assume a fully capable chip. The Galileo 2 for example lacks a few instruction sets from the `ia32` architecture. A few other platforms have similar issues. So if you get `Illegal Instruction` when trying to run serialport you'll need to rebuild the serialport binary by asking npm to rebuild it.

```bash
# Will ask npm to build serialport during install time
npm install serialport --build-from-source

# If you have a package that depends on serialport you can ask npm to rebuild it specifically.
npm rebuild serialport --build-from-source

# Or leave out the package name to rebuild everything.
npm rebuild --build-from-source
```

## Usage

Opening a serial port:

```js
var SerialPort = require("serialport");
var port = new SerialPort("/dev/tty-usbserial1", {
  baudRate: 57600
});
```

When opening a serial port, you can specify (in this order).

1. Path to Serial Port - required.
1. Options - optional and described below.

### Opening a Port

Constructing a `SerialPort` object will open a port on `nextTick`. You can bind events while the port is opening but you must wait until it is open to `write()` to it. (Most port functions require an open port.) You can call code when a port is opened in three ways.

 - The `open` event is always emitted when the port is opened
 - The constructor's openCallback is passed to `.open()` when the `autoOpen` option hasn't been disabled, if you have disabled it the callback is ignored.
 - The `.open()` function takes a callback that is called after the port is opened. This can be used if you disabled the `autoOpen` option or have previously closed an open port.


```js
var SerialPort = require('serialport');
var port = new SerialPort('/dev/tty-usbserial1');

port.on('open', function() {
  port.write('main screen turn on', function(err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('message written');
  });
});

// open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
})
```

This could be moved to the constructor's callback.
```js
var SerialPort = require('serialport');
var port = new SerialPort('/dev/tty-usbserial1', function (err) {
  if (err) {
    return console.log('Error: ', err.message);
  }
  port.write('main screen turn on', function(err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('message written');
  });
});
```

When disabling the `autoOpen` option you'll need to open the port on your own.

```js
var SerialPort = require('serialport');
var port = new SerialPort('/dev/tty-usbserial1', { autoOpen: false });

port.open(function (err) {
  if (err) {
    return console.log('Error opening port: ', err.message);
  }

  // write errors will be emitted on the port since there is no callback to write
  port.write('main screen turn on');
});

// the open event will always be emitted
port.on('open', function() {
  // open logic
});
```

### Listing Ports

`.list(callback)`

Retrieves a list of available serial ports with metadata.

* `callback` is a required function that looks should look like: `function (err, ports) { ... }`. `ports` will be an array of objects with port info. Only the `comName` is guaranteed, all the other fields undefined if unavailable. The `comName` is either the path or identifier (eg `COM1`) used to open the serialport.

```js
// example port information
{
  comName: '/dev/cu.usbmodem1421',
  manufacturer: 'Arduino (www.arduino.cc)',
  serialNumber: '757533138333964011C1',
  pnpId: undefined,
  locationId: '0x14200000',
  vendorId: '0x2341',
  productId: '0x0043'
}

```

```js
var SerialPort = require('serialport');
SerialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});
```

### Parsers

Out of the box, node-serialport provides four parsers: one that simply emits the raw buffer as a data event, one that emits a data event when a specfic byte sequence is received, one that emits a data event every 'length' bytes, and one which provides familiar "readline" style parsing.

To use the readline parser, you must provide a delimiter as such:

```js
var SerialPort = require('serialport');

var port = new SerialPort('/dev/tty-usbserial1', {
  parser: SerialPort.parsers.readline('\n')
});
```

To use the raw parser don't specify any parser, however if you really want to you can:

```js
var SerialPort = require('serialport');

var port = new SerialPort('/dev/tty-usbserial1', {
  parser: SerialPort.parsers.raw
});
```

Note that the raw parser does not guarantee that all data it receives will come in a single event.

To use the byte sequence parser, you must provide a delimiter as an array of bytes:
```js
var SerialPort = require('serialport');

var port = new SerialPort('/dev/tty-usbserial1', {
  parser: SerialPort.parsers.byteDelimiter([10,13])
});
```

To use the byte length parser, you must provide a delimiter as a length in bytes:
```js
var SerialPort = require('serialport');

var port = new SerialPort('/dev/tty-usbserial1', {
  parser: SerialPort.parsers.byteLength(5)
});
```

You can get updates of new data from the Serial Port as follows:

```js
port.on('data', function (data) {
  console.log('Data: ' + data);
});
```

You can write to the serial port by sending a string or buffer to the write method as follows:

```js
port.write('Hi Mom!');
port.write(new Buffer('Hi Mom!'));
```

Enjoy and do cool things with this code.

## Methods

### SerialPort (path, options, openCallback)

Create a new serial port object for the `path`. In the case of invalid arguments or invalid options when constructing a new SerialPort it will throw an error. The port will open automatically by default which is the equivalent of calling `port.open(openCallback)` in the next tick. This can be disabled by setting the option `autoOpen` to false.

**_path_**

The system path of the serial port to open. For example, `/dev/tty` on Mac/Linux or `COM1` on Windows.

**_options (optional)_**

Port configuration options.

* `autoOpen` Automatically opens the port on `nextTick`, defaults to `true`.
* `lock` Prevent other processes from opening the port, defaults to `true`. `false` is not currently supported on windows.
* `baudRate` Baud Rate, defaults to 9600. Should be one of: 115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300, 200, 150, 134, 110, 75, or 50. Custom rates as allowed by hardware is supported. Windows doesn't support custom baud rates.
* `dataBits` Data Bits, defaults to 8. Must be one of: 8, 7, 6, or 5.
* `stopBits` Stop Bits, defaults to 1. Must be one of: 1 or 2.
* `parity` Parity, defaults to 'none'. Must be one of: 'none', 'even', 'mark', 'odd', 'space'
* `rtscts` flow control, defaults to false
* `xon` flow control, defaults to false
* `xoff` flow control, defaults to false
* `xany` flow control, defaults to false
* `bufferSize` Size of read buffer, defaults to 65536. Must be an integer value.
* `parser` The parser engine to use with read data, defaults to rawPacket strategy which just emits the raw buffer as a "data" event. Can be any function that accepts EventEmitter as first parameter and the raw buffer as the second parameter.
* `platformOptions` - sets platform specific options, see below.

#### Unix Platform Options

These properties are ignored for windows. An object with the following properties:

* `vmin` (default: 1) - see [`man termios`](http://linux.die.net/man/3/termios)
* `vtime` (default: 0) - see [`man termios`](http://linux.die.net/man/3/termios)

**_`openCallback` (optional)_**

This function is passed to `.open()` and called when a connection has been opened. The callback should be a function that looks like: `function (error) { ... }`

**Note:** The callback will NOT be called if autoOpen is set to false as the open will not be performed.

### .open (callback)

Opens a connection to the given serial port.

**_callback (optional)_**

Called when a connection has been opened. The callback should be a function that looks like: `function (error) { ... }`

### .isOpen()

Returns `true` if the port is open.

### .write (buffer, callback)

Writes data to the given serial port.

**_buffer_**

The `buffer` parameter accepts a [`Buffer` ](http://nodejs.org/api/buffer.html) object, or a type that is accepted by the `Buffer` constructor (ex. an array of bytes or a string).

**_callback (optional)_**

Called once the write operation returns. The callback should be a function that looks like: `function (error) { ... }`

**Note:** The write operation is non-blocking. When it returns, data may still have not actually been written to the serial port. See `drain()`.

**Note:** Some devices like the Arduino reset when you open a connection to them. In these cases if you immediately write to the device they wont be ready to receive the data. This is often worked around by having the Arduino send a "ready" byte that your node program waits for before writing. You can also often get away with waiting around 400ms.

### .pause ()

Pauses an open connection.

### .resume ()

Resumes a paused connection.

### .flush (callback)

Flushes data received but not read. See [`tcflush()`](http://linux.die.net/man/3/tcflush) for Mac/Linux and [`FlushFileBuffers`](http://msdn.microsoft.com/en-us/library/windows/desktop/aa364439) for Windows.

**_callback (optional)_**

Called once the flush operation returns. The callback should be a function that looks like: `function (error) { ... }`

### .drain (callback)

Waits until all output data has been transmitted to the serial port. See [`tcdrain()`](http://linux.die.net/man/3/tcdrain) or [FlushFileBuffers()](https://msdn.microsoft.com/en-us/library/windows/desktop/aa364439(v=vs.85).aspx) for more information.

**_callback (optional)_**

Called once the drain operation returns. The callback should be a function that looks like: `function (error) { ... }`

**Example**

Writes `data` and waits until it has finish transmitting to the target serial port before calling the callback.

```
function writeAndDrain (data, callback) {
  sp.write(data, function () {
    sp.drain(callback);
  });
}
```

### .close (callback)

Closes an open connection.

**_callback (optional)_**

Called once a connection is closed. The callback should be a function that looks like: `function (error) { ... }` If called without an callback and there is an error, an error event will be emitted.

### .set (options, callback)

Sets flags on an open port. Uses [`SetCommMask`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363257(v=vs.85).aspx) for windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for mac and linux.

**_options (optional)_**

All options are operating system default when the port is opened. Every flag is set on each call to the provided or default values. If options isn't provided default options will be used.

 * `brk` optional boolean, defaults to false
 * `cts` optional boolean, defaults to false
 * `dsr` optional boolean, defaults to false
 * `dtr` optional boolean, defaults to true
 * `rts` optional boolean, defaults to true

**_callback (optional)_**

`function(err) {}`

Called once the port's flags have been set. If `.set` is called without an callback and there is an error, an error event will be emitted.

### .update (options, callback)

Changes the baudrate for an open port. Throws if you provide a bad argument. Emits an error or calls the callback if the baud rate isn't supported.

**_options_**

 * `baudRate` Baud Rate should be one of: 115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300, 200, 150, 134, 110, 75, or 50. Custom rates as allowed by hardware is supported.

**_callback (optional)_**

`callback: function(err)`

Called once the port's baud rate has been changed. If `.update` is called without an callback and there is an error, an error event will be emitted.

## Events

### .on('open', callback)
Callback is called with no arguments when the port is opened and ready for writing. This happens if you have the constructor open immediately (which opens in the next tick) or if you open the port manually with `open()`. See [Useage/Open Event](#open-event) for more information.

### .on('data', callback)
Callback is called with data depending on your chosen parser. The default `raw` parser will have a `Buffer` object with a varying amount of data in it. The `readLine` parser will provide a string of your line. See the [parsers](#parsers) section for more information

### .on('close', callback)
Callback is called with no arguments when the port is closed. In the event of an error, an error event will be triggered

### .on('error', callback)
Callback is called with an error object whenever there is an error.

### .on('disconnect', callback)
Callback is called with an error object. This will always happen before a `close` event if a disconnection is detected.

## Command Line Tools
If you install `serialport` globally. (eg, `npm install -g serialport`) you'll receive two command line tools.

### Serial Port List
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
/dev/cu.Bluetooth-Incoming-Port
/dev/cu.usbmodem1421    Arduino (www.arduino.cc)

$ serialport-list -f json
[{"comName":"/dev/cu.Bluetooth-Incoming-Port"},{"comName":"/dev/cu.usbmodem1421","manufacturer":"Arduino (www.arduino.cc)","serialNumber":"752303138333518011C1","locationId":"0x14200000","vendorId":"0x2341","productId":"0x0043"}]

$ serialport-list -f jsonline
{"comName":"/dev/cu.Bluetooth-Incoming-Port"}
{"comName":"/dev/cu.usbmodem1421","manufacturer":"Arduino (www.arduino.cc)","serialNumber":"752303138333518011C1","locationId":"0x14200000","vendorId":"0x2341","productId":"0x0043"}
```

### Serial Port Terminal
`serialport-term provides a basic terminal interface for communicating over a serial port. `ctrl+c` will exit.

```bash
$ serialport-term -h

  Usage: serialport-term -p <port> [options]

  A basic terminal interface for communicating over a serial port. Pressing ctrl+c exits.

  Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -l --list                      List available ports then exit
    -p, --port, --portname <port>  Path or Name of serial port
    -b, --baud <baudrate>          Baud rate default: 9600
    --databits <databits>          Data bits default: 8
    --parity <parity>              Parity default: none
    --stopbits <bits>              Stop bits default: 1
    --echo --localecho             Print characters as you type them.

$ serialport-term -l
/dev/cu.Bluetooth-Incoming-Port
/dev/cu.usbmodem1421    Arduino (www.arduino.cc)
```
