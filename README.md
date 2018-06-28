# Node Serialport

[![npm](https://img.shields.io/npm/dm/serialport.svg?maxAge=2592000)](http://npmjs.com/package/serialport)
[![Gitter chat](https://badges.gitter.im/EmergingTechnologyAdvisors/node-serialport.svg)](https://gitter.im/EmergingTechnologyAdvisors/node-serialport)
[![Known Vulnerabilities](https://snyk.io/test/github/node-serialport/node-serialport/badge.svg)](https://snyk.io/test/github/node-serialport/node-serialport)
[![codecov](https://codecov.io/gh/node-serialport/node-serialport/branch/master/graph/badge.svg)](https://codecov.io/gh/node-serialport/node-serialport)
[![Build Status](https://travis-ci.org/node-serialport/node-serialport.svg?branch=master)](https://travis-ci.org/node-serialport/node-serialport)
[![Build status](https://ci.appveyor.com/api/projects/status/u6xe3iao2crd7akn/branch/master?svg=true)](https://ci.appveyor.com/project/serialport/node-serialport/branch/master)
[![Greenkeeper badge](https://badges.greenkeeper.io/node-serialport/node-serialport.svg)](https://greenkeeper.io/)

## Intro to Node-Serialport

Imagine a world where you can write JavaScript to control blenders, lights, security systems, or even robots. That's right—robots! Thanks to Node Serialport, that world is here.

Node-Serialport provides a stream interface for the low-level serial port code necessary to control [Arduino](http://www.arduino.cc/) chipsets, X10 interfaces, [Zigbee](http://www.zigbee.org/) radios, highway signs, lcd screens, cash drawers, motor controllers, sensor packages, fork lifts, modems, drones, CNC machines, plotters, vending machines, ccTalk coin accecptors, SMS Gateways, RFID scanners and much more. If you have a hardware device with a [UART](https://en.wikipedia.org/wiki/Universal_asynchronous_receiver/transmitter) we can speak to it. The physical world is your oyster with this goodie.

For a full breakdown of why we made Node-Serialport, please read [NodeBots - The Rise of JS Robotics](http://www.voodootikigod.com/nodebots-the-rise-of-js-robotics). It explains why one would want to program robots in JS in the first place.

We're not against firmware but we're better than it.

## Quick Answers to Important Questions
- [**API Docs**](https://node-serialport.github.io/node-serialport/)
- [Parsers API Docs](https://node-serialport.github.io/utilities/)
- **For support**, open a [GitHub issue](https://github.com/node-serialport/node-serialport/issues/new).
- **For discussions, design ideas, and clarifications**, please join our [Gitter chat room](https://gitter.im/EmergingTechnologyAdvisors/node-serialport).
- **To contribute**, please review our [contribution guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md). You might want to check out our [roadmap](https://github.com/node-serialport/node-serialport/issues/746). We also have issues tagged ["good first PR"](https://github.com/node-serialport/node-serialport/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+pr%22), if you'd like to start somewhere specific. We'll do our best to support you until we merge your PR.

***

## API Documentation

- [**API Docs**](https://node-serialport.github.io/node-serialport/)
- [Parsers API Docs](https://node-serialport.github.io/utilities/)

See our [changelog](CHANGELOG.md) for what's new, and our [upgrade guide](UPGRADE_GUIDE.md) for a walk-through on differences between major versions.

Older versions are no longer supported but their docs can be found by looking through release tags.

You can generate the docs by running

```bash
npm run docs
```

And browsing to `./docs/index.html`.

Parsers have been spun out in to their own [GitHub Repo](https://github.com/node-serialport/parsers).

***
## Helpful Resources for Getting Started with Node-Serialport

In addition to reading the [article mentioned above](http://www.voodootikigod.com/nodebots-the-rise-of-js-robotics), these others might help you:
* [Johnny-Five](http://johnny-five.io/#hello-world): The Johnny-Five Robotics and IoT platform's six-line "Hello World" (awesome).
* [Arduino Node Security Sensor Hacking](http://nexxylove.tumblr.com/post/20159263403/arduino-node-security-sensor-hacking): A great all-around "how do I use this" article.

***
## Table of Contents

* [Platform Support](#platform-support)
* [Installation](#installation-instructions)
* [Installation Special Cases](#installation-special-cases)
  * [Alpine Linux](#alpine-linux)
  * [Electron](#electron)
  * [Illegal Instruction](#illegal-instruction)
  * [Mac OS X](#mac-os-x)
  * [Raspberry Pi Linux](#raspberry-pi-linux)
  * [sudo / root](#sudo--root)
  * [Ubuntu/Debian Linux](#ubuntudebian-linux)
  * [Windows](#windows)
* [Usage](#usage)
  * [Opening a Port](#opening-a-port)
  * [Testing](#testing)
  * [Debugging](#debugging)
  * [Error Handling](#error-handling)
* [Command Line Tools](#command-line-tools)
  * [Serial Port List](#serial-port-list)
  * [Srial Port Terminal](#serial-port-terminal)
  * [Serial Port Repl](#serial-port-repl)
* [License](#license)

***

### Platform Support
`serialport` supports NodeJS v4 and upwards. For versions 0.10 and 0.12, use `serialport@4`. The platforms, architectures and Node versions that `serialport` supports are the following;

| Platform / Arch | Node v4.x | Node v6.x | Node v8.x | Node v9.x | Node v10.x |
|       ---       | --- | --- | --- | --- | --- |
| Linux / ia32⁴   |  ☑  |  ☑  |  ☑  |  ☑  |  ☐  |
| Linux / x64     |  ☑  |  ☑  |  ☑  |  ☑  |  ☑  |
| Linux / ARM v6¹ |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |
| Linux / ARM v7¹ |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |
| Linux / ARM v8¹ |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |
| Linux / MIPSel¹ |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |
| Linux / PPC64¹  |  ☐  |  ☐  |  ☐  |  ☐  |  ☐  |
| Windows² / x86  |  ☐  |  ☑  |  ☑  |  ☑  |  ☑  |
| Windows² / x64  |  ☑  |  ☑  |  ☑  |  ☑  |  ☑  |
| OSX³ / x64      |  ☑  |  ☑  |  ☑  |  ☑  |  ☑  |

¹ ARM, MIPSel and PPC64¹ platforms are not currently part of our testing or build matrix, but are known to work.

² Windows 7, 8, 10, and 10 IoT are supported, but our CI tests only Windows Server 2012 R2.

³ OSX 10.4 Tiger and above are supported, but our CI tests only 10.9.5 Mavericks with Xcode 6.1.

⁴ NodeJS has dropped prebuilt binaries for NodeJS 10 on 32bit linux. As a result it's too difficult to maintain  support. However if you build nodejs and serialport yourself it will probably work.

## Installation Instructions

For most "standard" use cases (Node v4.x on Mac, Linux, or Windows on a x86 or x64 processor), Node-Serialport will install nice and easy with:

```
npm install serialport
```

### Installation Special Cases

We use [prebuild](https://github.com/mafintosh/prebuild) to compile and post binaries of the library for most common use cases (Linux, Mac, Windows on standard processor platforms). If you have a special case, Node-Serialport will work, but it will compile the binary during the install. Compiling with nodejs is done via `node-gyp` which requires Python 2.x, so please ensure you have it installed and in your path for all operating systems. Python 3.x will not work.

This assumes you have everything on your system necessary to compile ANY native module for Node.js. If you don't, then please ensure the following are true for your system before filing a "Does not install" issue.

#### Alpine Linux

[Alpine](http://www.alpinelinux.org/) is a (very) small distro, but it uses the [musl](https://www.musl-libc.org/) standard library instead of [glibc](https://www.gnu.org/software/libc/) (used by most other Linux distros) so it requires compilation. It's commonly used with Docker. A user has confirmed that Node-Serialport works with [alpine-node](https://github.com/mhart/alpine-node).

```
# If you don't have node/npm already, add that first
sudo apk add --no-cache nodejs

# Add the necessary build and runtime dependencies
sudo apk add --no-cache make gcc g++ python linux-headers udev

# Then we can install serialport, forcing it to compile
npm install serialport --build-from-source

# If you're installing as root, you'll also need to use the --unsafe-perm flag
```

#### Electron

[Electron](https://electron.atom.io/) is a framework for creating cross-platform desktop applications. It comes with its own version of the Node.js runtime.

If you require `serialport` as a dependency for an Electron project, you must compile it for the version of Electron your project's using.

When you first install `serialport` it will compile against the version of Node.js on your machine, not against the Node.js runtime bundled with Electron.

To recompile `serialport` (or any native Node.js module) for Electron, you can use `electron-rebuild`; more info at Electron's [README](https://github.com/electron/electron-rebuild/blob/master/README.md).

1. `npm install --save-dev electron-rebuild`
2. Add `electron-rebuild` to your project's package.json's install hook
3. Run `npm install`

For an example project, check out [`electron-serialport`](https://github.com/johnny-five-io/electron-serialport).

#### NW.js

[NW.js](https://nwjs.io/) is an app runtime based on Chromium and node.js.

Like Electron, NW.js also requires compilation against its own specific headers.

To instruct `prebuild` to build against the correct headers, place a file named `.prebuildrc` on your package root with the following content:

```
build_from_source=true
runtime=node-webkit
target=<target_version>
```

Where `<target_version>` is the NW.js version you are building against (for example, `0.26.6`).

OBS: NW.js support requires `prebuild >= 7.3.0`.

#### Illegal Instruction

The pre-compiled binaries assume a fully capable chip. Intel's [Galileo 2](https://software.intel.com/en-us/iot/hardware/galileo), for example, lacks a few instruction sets from the `ia32` architecture. A few other platforms have similar issues. If you get `Illegal Instruction` when trying to run Node-Serialport, you'll need to ask npm to rebuild the Serialport binary.

```bash
# Will ask npm to build serialport during install time
npm install serialport --build-from-source

# If you have a package that depends on serialport, you can ask npm to rebuild it specifically...
npm rebuild serialport --build-from-source
```

#### Mac OS X

Ensure that you have at a minimum the xCode Command Line Tools installed appropriate for your system configuration. If you recently upgraded the OS, it probably removed your installation of Command Line Tools, please verify before submitting a ticket. To compile `node-serialport` with Node.js 4.x+, you will need to use g++ v4.8 or higher.

#### Raspberry Pi Linux

Follow the instructions for [setting up a Raspberry pi for use with Johnny-Five and Raspi IO](https://github.com/nebrius/raspi-io/wiki/Getting-a-Raspberry-Pi-ready-for-NodeBots). These projects use Node Serialport under the hood.

| Revision       |      CPU              | Arm Version |
|   ----         |      ---              |     ---     |
| A, A+, B, B+   | 32-bit ARM1176JZF-S   |    ARMv6    |
| Compute Module | 32-bit ARM1176JZF-S   |    ARMv6    |
| Zero           | 32-bit ARM1176JZF-S   |    ARMv6    |
| B2             | 32-bit ARM Cortex-A7  |    ARMv7    |
| B3             | 32-bit ARM Cortex-A53 |    ARMv8    |

#### sudo / root
If you're going to use `sudo` or root to install Node-Serialport, `npm` will require you to use the unsafe parameters flag.

```bash
sudo npm install serialport --unsafe-perm --build-from-source
```

Failure to use the flag results in an error like this:

```bash
root@rpi3:~# npm install -g serialport
/usr/bin/serialport-list -> /usr/lib/node_modules/serialport/bin/serialport-list.js
/usr/bin/serialport-term -> /usr/lib/node_modules/serialport/bin/serialport-terminal.js


> serialport@6.0.0-beta1 install /Users/wizard/src/node-serialport
> prebuild-install || node-gyp rebuild

prebuild-install info begin Prebuild-install version 2.2.1
prebuild-install info install installing standalone, skipping download.

gyp WARN EACCES user "root" does not have permission to access the dev dir "/root/.node-gyp/6.9.1"
gyp WARN EACCES attempting to reinstall using temporary dev dir "/usr/lib/node_modules/serialport/.node-gyp"
make: Entering directory '/usr/lib/node_modules/serialport/build'
make: *** No rule to make target '../.node-gyp/6.9.1/include/node/common.gypi', needed by 'Makefile'.  Stop.
make: Leaving directory '/usr/lib/node_modules/serialport/build'
gyp ERR! build error
gyp ERR! stack Error: `make` failed with exit code: 2

```

#### Ubuntu/Debian Linux

The best way to install any version of Node.js is to use the [NodeSource Node.js binary distributions](https://github.com/nodesource/distributions#installation-instructions). Older versions of Ubuntu install Node.js with the wrong version and binary name. If your Node binary is `nodejs` instead of `node`, or if your Node version is [`v0.10.29`](https://github.com/fivdi/onoff/wiki/Node.js-v0.10.29-and-native-addons-on-the-Raspberry-Pi), then you should follow these instructions.

You'll need the package `build-essential` to compile `serialport`. If there's a binary for your platform, you won't need it. Keep rocking!

```
# Using Ubuntu and Node 6
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs

# Using Debian and Node 6 as root
curl -sL https://deb.nodesource.com/setup_7.x | bash -
apt-get install -y nodejs
```

#### Windows
Node-Serialport supports Windows 7, 8.1, 10, and 10 IoT. Precompiled binaries are available, but if you want to build it from source you'll need to follow the [node-gyp installation](https://github.com/nodejs/node-gyp#installation) instructions. Once you've got things working, you can install Node-Serialport from source with:

```powershell
npm install serialport --build-from-source
```

Node-gyp's documentation doesn't mention it, but it sometimes helps to create a C++ project in [Visual Studio](https://www.visualstudio.com/) so that it will install any necessary components not already installed during the past two hours of setup. This will solve some instances of `Failed to locate: "CL.exe"`.

An old issue that you may still run into. When working with multiple Serial Ports you can set the `UV_THREADPOOL_SIZE` environment variable to be set to 1 + the number of ports you wish to open at a time. (Defaults to `4` which supports 3 open ports).

## Usage

### Opening a Port

```js
var SerialPort = require('serialport');
var port = new SerialPort('/dev/tty-usbserial1', {
  baudRate: 57600
});
```

When opening a serial port, specify (in this order)

1. Path to Serial Port - required.
1. Options - optional and described below.

Constructing a `SerialPort` object immediately opens a port. While you can read and write at any time (it will be queued until the port is open), most port functions require an open port. There are three ways to detect when a port is opened.

- The `open` event is always emitted when the port is opened.
- The constructor's openCallback is passed to `.open()`, if you haven't disabled the `autoOpen` option. If you have disabled it, the callback is ignored.
- The `.open()` function takes a callback that is called after the port is opened. You can use this if you've disabled the `autoOpen` option or have previously closed an open port.

```js
var SerialPort = require('serialport');
var port = new SerialPort('/dev/tty-usbserial1');

port.write('main screen turn on', function(err) {
  if (err) {
    return console.log('Error on write: ', err.message);
  }
  console.log('message written');
});

// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
})
```

Detecting open errors can be moved to the constructor's callback.
```js
var SerialPort = require('serialport');
var port = new SerialPort('/dev/tty-usbserial1', function (err) {
  if (err) {
    return console.log('Error: ', err.message);
  }
});

port.write('main screen turn on', function(err) {
  if (err) {
    return console.log('Error on write: ', err.message);
  }
  console.log('message written');
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

  // Because there's no callback to write, write errors will be emitted on the port:
  port.write('main screen turn on');
});

// The open event is always emitted
port.on('open', function() {
  // open logic
});
```

Get updates of new data from the serial port as follows:

```js
// Switches the port into "flowing mode"
port.on('data', function (data) {
  console.log('Data:', data);
});

// Read data that is available but keep the stream from entering "flowing mode"
port.on('readable', function () {
  console.log('Data:', port.read());
});
```

You can write to the serial port by sending a string or buffer to the write method:

```js
port.write('Hi Mom!');
port.write(Buffer.from('Hi Mom!'));
```

Enjoy and do cool things with this code.

### Testing

Testing is an important feature of any library. To aid in our own tests we've developed a `MockBinding` a fake hardware binding that doesn't actually need any hardware to run. This class passes all of the same tests as our hardware based bindings and provides a few additional test related interfaces. To use the mock binding check out the example [here](/examples/mocking.js).

```js
const SerialPort = require('serialport/test');
const MockBinding = SerialPort.Binding;

// Create a port and enable the echo and recording.
MockBinding.createPort('/dev/ROBOT', { echo: true, record: true })
const port = new SerialPort('/dev/ROBOT')
```

### Debugging

We use the [debug](https://www.npmjs.com/package/debug) package and log under the `serialport` namespace:

 - `serialport:main` for all high-level/main logging
 - `serialport:binding` for all low-level logging

You can enable logging through environment variables. Check the [debug](https://www.npmjs.com/package/debug) docs for info.

```bash
DEBUG=serialport:main node myapp.js
DEBUG=serialport:* node myapp.js
DEBUG=* node myapp.js
```

You can enable core dumps on osx with;
```bash
ulimit -c unlimited for core dumps
```

You can "console.log" from c++ with;
```c++
fprintf(stdout, "Hellow World num=%d str=%s\n", 4, "hi");
```

You can make use of the `serialport-repl` command with;
```bash
serialport-repl # to auto detect an arduino
serialport-repl /path/name # to connect to a specific port
```

It will load a serialport object with debugging turned on.

### Error Handling

All functions in Node-Serialport follow two conventions:

- Argument errors throw a `TypeError` object. You'll see these when functions are called with invalid arguments.
- Runtime errors provide `Error` objects to the function's callback or emit an [`error event`](#module_serialport--SerialPort+event_error) if no callback is provided. You'll see these when a runtime error occurs, like trying to open a bad port or setting an unsupported baud rate.

You should never have to wrap a Node-Serialport object in a try/catch statement if you call the functions with the correct arguments.

## Command Line Tools
If you install `serialport` globally (e.g., `npm install -g serialport`), you'll receive two command line tools.

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
/dev/tty.Bluetooth-Incoming-Port
/dev/tty.usbmodem1421    Arduino (www.arduino.cc)

$ serialport-list -f json
[{"comName":"/dev/tty.Bluetooth-Incoming-Port"},{"comName":"/dev/tty.usbmodem1421","manufacturer":"Arduino (www.arduino.cc)","serialNumber":"752303138333518011C1","locationId":"14200000","vendorId":"2341","productId":"0043"}]

$ serialport-list -f jsonline
{"comName":"/dev/tty.Bluetooth-Incoming-Port"}
{"comName":"/dev/tty.usbmodem1421","manufacturer":"Arduino (www.arduino.cc)","serialNumber":"752303138333518011C1","locationId":"14200000","vendorId":"2341","productId":"0043"}
```

### Serial Port Terminal
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

### Serial Port Repl
`serialport-repl` provides a nodejs repl for working with serialport. This is valuable when debugging.

You can make use of the `serialport-repl` command with;
```bash
$ serialport-repl # to auto detect an arduino
$ serialport-repl /dev/tty.usbmodem1421 # to connect to a specific port
```

It will load a serialport object with debugging turned on.
```
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

## License
SerialPort is [MIT licensed](LICENSE) and all it's dependencies are MIT or BSD licensed.
