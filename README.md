# Node Serialport

[![Build Status](https://travis-ci.org/voodootikigod/node-serialport.svg?branch=master)](https://travis-ci.org/voodootikigod/node-serialport)
[![Build status](https://ci.appveyor.com/api/projects/status/u6xe3iao2crd7akn/branch/master?svg=true)](https://ci.appveyor.com/project/j5js/node-serialport/branch/master)
[![Gitter chat](https://badges.gitter.im/voodootikigod/node-serialport.svg)](https://gitter.im/voodootikigod/node-serialport)
[![Dependency Status](https://david-dm.org/voodootikigod/node-serialport.svg)](https://david-dm.org/voodootikigod/node-serialport)

For support you can open a [github issue](https://github.com/voodootikigod/node-serialport/issues/new), for discussions, designs, and clarifications, we recommend you join our [Gitter Chat room](https://gitter.im/voodootikigod/node-serialport). We have two related projects [Browser Serialport](https://github.com/garrows/browser-serialport) "just like Node Serialport but for browser apps", and [Serialport Test Piliot](https://github.com/j5js/serialport-test-pilot) which helps us test serialport.

***

You're reading the README for the master branch of serialport. You might want to look at the README of our latest release. See our [change log](changelog.md) for what's new.

 - [`serialport@3.1.2` docs are here](https://github.com/voodootikigod/node-serialport/blob/3.1.2/README.md) it is the latest `3.x` releases.
 - [`serialport@2.1.2` docs are here](https://github.com/voodootikigod/node-serialport/blob/2.1.2/README.md) it was the last `2.x` release
 - [`serialport@1.7.4` docs are here](https://github.com/voodootikigod/node-serialport/blob/v1.7.4/README.md) it was the last `1.x` release

***

Imagine a world where you can write JavaScript to control blenders, lights, security systems, or even robots. Yes, I said robots. That world is here and now with node-serialport. It provides a very simple interface to the low level serial port code necessary to program [Arduino](http://www.arduino.cc/) chipsets, [X10](http://www.smarthome.com/manuals/protocol.txt) wireless communications, or even the rising [Z-Wave](http://www.z-wave.com/modules/ZwaveStart/) and [Zigbee](http://www.zigbee.org/) standards. The physical world is your oyster with this goodie. For a full break down of why we made this, please read [NodeBots - The Rise of JS Robotics](http://www.voodootikigod.com/nodebots-the-rise-of-js-robotics).

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
  * [Ubuntu Linux](#ubuntu-linux)
  * [Alpine Linux](#alpine-linux)
  * [Raspberry Pi Linux](#raspberry-pi-linux)
  * [Illegal Instruction](#illegal-instruction)
* [Usage](#usage)
  * [Opening a Port](#opening-a-port)
  * [Listing Ports](#listing-ports)
  * [Parsers](#parsers)
* [Methods](#methods)
  * [SerialPort](#serialport-path-options-openimmediately-callback)
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
`serialport` supports and tests against the following platforms, architectures and node versions. Node V6 works but isn't officially supported yet.

| Platform / Arch | Node v0.10.x | Node v0.12.x | Node v4.x | Node v5.x | Node v6.x |
| --- | --- | --- | --- | --- | --- |
| Linux / ia32 | ☑ | ☑ | ☑ | ☑ | ☐ |
| Linux / x64 | ☑ | ☑ | ☑ | ☑ | ☐ |
| Windows¹ / x86 | ☑ | ☑ | ☑ | ☑ | ☐ |
| Windows¹ / x64 | ☑ | ☑ | ☑ | ☑ | ☐ |
| OSX² / x64 | ☑ | ☑ | ☑ | ☑ | ☐ |

¹ Windows 7, 8, 10, and 10 IoT are supported but only Windows Server 2012 R2 is tested by our CI.

² OSX 10.4 Tiger and above are supported but only 10.9.5 Mavericks with Xcode 6.1 is tested in our CI.

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

#### Ubuntu Linux

You know what you need for your system, basically your appropriate analog of build-essential. Keep rocking! Ubuntu renamed the `node` binary `nodejs` which can cause problems building `node-serialport`. The fix is simple, install the [nodejs-legacy package](https://packages.debian.org/sid/nodejs-legacy) that symlinks `/usr/bin/nodejs => /usr/bin/node` or install the more up to date nodejs package from [Chris Lea's PPA](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#ubuntu-mint-elementary-os).


```
# Ubuntu node
sudo apt-get install nodejs nodejs-legacy

# Or Chris Lea's PPA Node (more up to date)
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs

sudo apt-get install build-essential
npm install serialport
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
var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/tty-usbserial1", {
  baudrate: 57600
});
```

When opening a serial port, you can specify (in this order).

1. Path to Serial Port - required.
1. Options - optional and described below.

### Opening a Port

Constructing a `SerialPort` object will open a port, eventually. You can bind events while the port is opening but you must wait until it is open to `write()` to it. (Most port functions require an open port.) You can call code when a port is opened in three ways.

 - The `open` event is always emitted when the port is opened
 - The constructor callback is called when the port is opened and you haven't disabled the `openImmediately` option, if you have disabled it, the callback is only used for errors.
 - The `.open()` function takes a callback that is called when the port is opened. This can be used if you disabled the `openImmediately` option or have previously closed an open port.


```js
var SerialPort = require('serialport').SerialPort;
var port = new SerialPort('/dev/tty-usbserial1');

port.on('open', function () {
  port.write('main screen turn on', function(err, bytesWritten) {
    if (err) {
      return console.log('Error: ', err.message);
    }
    console.log(bytesWritten, 'bytes written');
  });
});
```

This could be moved to the constructor's callback.
```js
var SerialPort = require('serialport').SerialPort;
var port = new SerialPort('/dev/tty-usbserial1', function () {
  port.write('main screen turn on', function(err, bytesWritten) {
    if (err) {
      return console.log('Error: ', err.message);
    }
    console.log(bytesWritten, 'bytes written');
  });
});
```

When disabling the `openImmediately` flag you'll need to open the port on your own. Note, in order to disable the `openImmediately` flag, we have to pass an options object.

```js
var SerialPort = require('serialport').SerialPort;
var port = new SerialPort('/dev/tty-usbserial1', {}, false);

port.open(function (err) {
  if (err) {
    return console.log('Error opening port: ', err.message);
  }

  // errors will be emitted on the port since there is no callback to write
  port.write('main screen turn on');
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
var serialPort = require('serialport');
serialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});
```

### Parsers

Out of the box, node-serialport provides two parsers one that simply emits the raw buffer as a data event and the other which provides familiar "readline" style parsing. To use the readline parser, you must provide a delimiter as such:

```js
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

var port = new SerialPort('/dev/tty-usbserial1', {
  parser: serialport.parsers.readline('\n')
});
```

To use the raw parser, you just provide the function definition (or leave undefined):

```js
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

var port = new SerialPort('/dev/tty-usbserial1', {
  parser: serialport.parsers.raw
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

### SerialPort (path, options, openImmediately, callback)

Create a new serial port on `path`.

**_path_**

The system path of the serial port to open. For example, `/dev/tty` on Mac/Linux or `COM1` on Windows.

**_options (optional)_**

Port configuration options.

* `baudRate` Baud Rate, defaults to 9600. Should be one of: 115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300, 200, 150, 134, 110, 75, or 50. Custom rates as allowed by hardware is supported. Windows doesn't support custom baud rates.
* `dataBits` Data Bits, defaults to 8. Must be one of: 8, 7, 6, or 5.
* `stopBits` Stop Bits, defaults to 1. Must be one of: 1 or 2.
* `parity` Parity, defaults to 'none'. Must be one of: 'none', 'even', 'mark', 'odd', 'space'
* `rtscts` defaults to false
* `xon` defaults to false
* `xoff` defaults to false
* `xany` defaults to false
* `flowControl` `true` for `rtscts` or an array with one or more of the following strings to enable them `xon`, `xoff`, `xany`, `rtscts`. Overwrites any individual settings.
* `bufferSize` Size of read buffer, defaults to 65536. Must be an integer value.
* `parser` The parser engine to use with read data, defaults to rawPacket strategy which just emits the raw buffer as a "data" event. Can be any function that accepts EventEmitter as first parameter and the raw buffer as the second parameter.
* `platformOptions` - sets platform specific options, see below.

#### Unix Platform Options

These properties are ignored for windows. An object with the following properties:

* `vmin` (default: 1) - see [`man termios`](http://linux.die.net/man/3/termios)
* `vtime` (default: 0) - see [`man termios`](http://linux.die.net/man/3/termios)

**_openImmediately (optional)_**

Attempts to open a connection to the serial port on `process.nextTick`. The default is `true`. Set to `false` to manually call `open()` at a later time, but note you'll need to use factory error listener in the case of constructor errors.

**_callback (optional)_**

Called when a connection has been opened. The callback should be a function that looks like: `function (error) { ... }`

**Note:** The callback will NOT be called if openImmediately is set to false as the open will not be performed.

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

Called once the write operation returns. The callback should be a function that looks like: `function (error, bytesWritten) { ... }`

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

Waits until all output data has been transmitted to the serial port. See [`tcdrain()`](http://linux.die.net/man/3/tcdrain) for more information.

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

`callback: function(err, results)`

Called once the port's flags have been set. `results` are the return of the underlying system command. If `.set` is called without an callback and there is an error, an error event will be emitted.

### .update (options, callback)

Changes the baudrate for an open port. Doesn't yet work on windows.

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
Callback is called with an error object.

## Command Line Tools
If you install `serialport` globally. (eg, `npm install -g serialport`) you'll receive two command line tools.

### Serial Port List
`serialportlist` will list all available serial ports in different formats.

```bash
$ serialportlist -h

  Usage: serialport-list [options]

  List available serial ports

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -f, --format <type>  Format the output as text, json, or jsonline. default: text


$ serialportlist
/dev/cu.Bluetooth-Incoming-Port
/dev/cu.usbmodem1421    Arduino (www.arduino.cc)

$ serialportlist -f json
[{"comName":"/dev/cu.Bluetooth-Incoming-Port"},{"comName":"/dev/cu.usbmodem1421","manufacturer":"Arduino (www.arduino.cc)","serialNumber":"752303138333518011C1","locationId":"0x14200000","vendorId":"0x2341","productId":"0x0043"}]

$ serialportlist -f jsonline
{"comName":"/dev/cu.Bluetooth-Incoming-Port"}
{"comName":"/dev/cu.usbmodem1421","manufacturer":"Arduino (www.arduino.cc)","serialNumber":"752303138333518011C1","locationId":"0x14200000","vendorId":"0x2341","productId":"0x0043"}
```

### Serial Port Terminal
`serialportterm` provides a basic terminal interface for communicating over a serial port. `ctrl+c` will exit.

```bash
$ serialportterminal -h

  Usage: serialport-terminal -p <port> [options]

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

$ serialportterminal -l
/dev/cu.Bluetooth-Incoming-Port
/dev/cu.usbmodem1421    Arduino (www.arduino.cc)
```
