# Node Serialport

<!-- STOP! WAIT! BEFORE YOU EDIT!

README.md is a generated file. Please don't edit it!

This file is generated from .docs/README.hbs and the JavaScript files themselves.
See our contributing guide for more information.

https://github.com/EmergingTechnologyAdvisors/node-serialport/blob/master/CONTRIBUTING.md#writing-docs

-->

[![npm](https://img.shields.io/npm/dm/serialport.svg?maxAge=2592000)](http://npmjs.com/package/serialport)
[![Gitter chat](https://badges.gitter.im/EmergingTechnologyAdvisors/node-serialport.svg)](https://gitter.im/EmergingTechnologyAdvisors/node-serialport)
[![Dependency Status](https://david-dm.org/EmergingTechnologyAdvisors/node-serialport.svg)](https://david-dm.org/EmergingTechnologyAdvisors/node-serialport)
[![codecov](https://codecov.io/gh/EmergingTechnologyAdvisors/node-serialport/branch/master/graph/badge.svg)](https://codecov.io/gh/EmergingTechnologyAdvisors/node-serialport)
[![Build Status](https://travis-ci.org/EmergingTechnologyAdvisors/node-serialport.svg?branch=master)](https://travis-ci.org/EmergingTechnologyAdvisors/node-serialport)
[![Build status](https://ci.appveyor.com/api/projects/status/u6xe3iao2crd7akn/branch/master?svg=true)](https://ci.appveyor.com/project/j5js/node-serialport/branch/master)
[![Greenkeeper badge](https://badges.greenkeeper.io/EmergingTechnologyAdvisors/node-serialport.svg)](https://greenkeeper.io/)

## Intro to Node-Serialport

Imagine a world in which you can write JavaScript to control blenders, lights, security systems, or even robots. That's right—robots! Thanks to Node Serialport, that world is here.

Node-Serialport provides a stream interface for the low-level serial port code necessary to controll [Arduino](http://www.arduino.cc/) chipsets, X10 interfaces, [Zigbee](http://www.zigbee.org/) radios, highway signs, lcd screens, cash drawers, motor controllers, sensor packages, fork lifts, modems, drones, CNC machines, plotters, vending machines, ccTalk coin accecptors, SMS Gateways, RFID scanners and much more. Chances are if if you have a hardware device that's meant to be controlled, it speaks serial. The physical world is your oyster with this goodie.

For a full breakdown of why we made Node-Serialport, please read [NodeBots - The Rise of JS Robotics](http://www.voodootikigod.com/nodebots-the-rise-of-js-robotics). It explains why one would want to program robots in JS in the first place.

We're not against firmware but we're better than it.

## Quick Answers to Important Questions
- **For support**, open a [GitHub issue](https://github.com/EmergingTechnologyAdvisors/node-serialport/issues/new).
- **For discussions, design ideas, and clarifications**, please join our [Gitter chat room](https://gitter.im/EmergingTechnologyAdvisors/node-serialport).
- **To test Node-Serialport**, we recommend two related projects—[Browser Serialport](https://github.com/garrows/browser-serialport) ("just like Node Serialport, but for browser apps") and [Serialport Test Piliot](https://github.com/j5js/serialport-test-pilot).
- **To contribute**, please review our [contribution guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md). You might want to check out our [roadmap](https://github.com/EmergingTechnologyAdvisors/node-serialport/issues/746). We also have issues tagged ["good first PR"](https://github.com/EmergingTechnologyAdvisors/node-serialport/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+pr%22), if you'd like to start somewhere specific. We'll do our best to support you until we merge your PR.

***

## For which version of Node-Serialport would you like documentation?

You're reading the README for Node-Serialport's master branch. You probably want to see the README for our most recent release. See our [changelog](changelog.md) for what's new, and our [upgrade guide](UPGRADE_GUIDE.md) for a walk-through on differences between major versions.

- [`serialport@5.0.0` docs](https://github.com/EmergingTechnologyAdvisors/node-serialport/blob/5.0.0/README.md) the latest `5.x` release. 🎉
- [`serialport@4.0.7` docs](https://github.com/EmergingTechnologyAdvisors/node-serialport/blob/4.0.7/README.md) the latest `4.x` release.
- [`serialport@3.1.2` docs](https://github.com/EmergingTechnologyAdvisors/node-serialport/blob/3.1.2/README.md) the last `3.x` release.

Older versions are no longer supported.

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
* [SerialPort](#exp_module_serialport--SerialPort) ⏏
    * [`new SerialPort(path, [options], [openCallback])`](#new_module_serialport--SerialPort_new)
    * _instance_
        * [`.open([callback])`](#module_serialport--SerialPort+open)
        * [`.update([options], [callback])`](#module_serialport--SerialPort+update)
        * [`.write(data, [encoding], [callback])`](#module_serialport--SerialPort+write) ⇒ <code>boolean</code>
        * [`.read([size])`](#module_serialport--SerialPort+read) ⇒ <code>string</code> &#124; <code>Buffer</code> &#124; <code>null</code>
        * [`.close(callback)`](#module_serialport--SerialPort+close)
        * [`.set([options], [callback])`](#module_serialport--SerialPort+set)
        * [`.get([callback])`](#module_serialport--SerialPort+get)
        * [`.flush([callback])`](#module_serialport--SerialPort+flush)
        * [`.drain([callback])`](#module_serialport--SerialPort+drain)
        * [`.pause()`](#module_serialport--SerialPort+pause) ⇒
        * [`.resume()`](#module_serialport--SerialPort+resume) ⇒
        * [`Event: "error"`](#module_serialport--SerialPort+event_error)
        * [`Event: "open"`](#module_serialport--SerialPort+event_open)
        * [`Event: "data"`](#module_serialport--SerialPort+event_data)
        * [`Event: "close"`](#module_serialport--SerialPort+event_close)
    * _static_
        * [`.Binding`](#module_serialport--SerialPort.Binding) : [<code>BaseBinding</code>](#module_serialport--SerialPort..BaseBinding)
        * [`.parsers`](#module_serialport--SerialPort.parsers) : <code>object</code>
        * [`.list([callback])`](#module_serialport--SerialPort.list) ⇒ <code>Promise</code>
    * _inner_
        * [~BaseBinding](#module_serialport--SerialPort..BaseBinding)
            * [`new BaseBinding(options)`](#new_module_serialport--SerialPort..BaseBinding_new)
            * _instance_
                * [`.open(path, openOptions)`](#module_serialport--SerialPort..BaseBinding+open) ⇒ <code>Promise</code>
                * [`.close()`](#module_serialport--SerialPort..BaseBinding+close) ⇒ <code>Promise</code>
                * [`.read(data, offset, length)`](#module_serialport--SerialPort..BaseBinding+read) ⇒ <code>Promise</code>
                * [`.write(data)`](#module_serialport--SerialPort..BaseBinding+write) ⇒ <code>Promise</code>
                * [`.update([options])`](#module_serialport--SerialPort..BaseBinding+update) ⇒ <code>Promise</code>
                * [`.set([options])`](#module_serialport--SerialPort..BaseBinding+set) ⇒ <code>Promise</code>
                * [`.get()`](#module_serialport--SerialPort..BaseBinding+get) ⇒ <code>Promise</code>
                * [`.flush()`](#module_serialport--SerialPort..BaseBinding+flush) ⇒ <code>Promise</code>
                * [`.drain()`](#module_serialport--SerialPort..BaseBinding+drain) ⇒ <code>Promise</code>
            * _static_
                * [`.list()`](#module_serialport--SerialPort..BaseBinding.list) ⇒ <code>Promise</code>
        * [`~errorCallback`](#module_serialport--SerialPort..errorCallback) : <code>function</code>
        * [`~modemBitsCallback`](#module_serialport--SerialPort..modemBitsCallback) : <code>function</code>
        * [`~openOptions`](#module_serialport--SerialPort..openOptions) : <code>Object</code>
        * [`~listCallback`](#module_serialport--SerialPort..listCallback) : <code>function</code>
* [Command Line Tools](#command-line-tools)
  * [Serial Port List](#serial-port-list)
  * [Serial Port Terminal](#serial-port-terminal)
  * [Serial Port Repl](#serial-port-repl)
* [License](#license)

***

### Platform Support
`serialport` supports NodeJS v4 and upwards. For versions 0.10 and 0.12, use `serialport@4`. The platforms, architectures and Node versions that `serialport` supports are the following;

| Platform / Arch | Node v4.x | Node v6.x | Node v8.x |
|       ---       | --- | --- | --- |
| Linux / ia32    |  ☑  |  ☑  |  ☑  |
| Linux / x64     |  ☑  |  ☑  |  ☑  |
| Linux / ARM v6¹ |  ☐  |  ☐  |  ☐  |
| Linux / ARM v7¹ |  ☐  |  ☐  |  ☐  |
| Linux / ARM v8¹ |  ☐  |  ☐  |  ☐  |
| Linux / MIPSel¹ |  ☐  |  ☐  |  ☐  |
| Linux / PPC64¹  |  ☐  |  ☐  |  ☐  |
| Windows² / x86  |  ☑  |  ☑  |  ☑  |
| Windows² / x64  |  ☑  |  ☑  |  ☑  |
| OSX³ / x64      |  ☑  |  ☑  |  ☑  |

¹ ARM, MIPSel and PPC64¹ platforms are not currently part of our testing or build matrix, but are known to work.

² Windows 7, 8, 10, and 10 IoT are supported, but our CI tests only Windows Server 2012 R2.

³ OSX 10.4 Tiger and above are supported, but our CI tests only 10.9.5 Mavericks with Xcode 6.1.

## Installation Instructions

For most "standard" use cases (Node v4.x on Mac, Linux, or Windows on a x86 or x64 processor), Node-Serialport will install nice and easy with:

```
npm install serialport
```

### Installation Special Cases

We use [node-pre-gyp](https://github.com/mapbox/node-pre-gyp) to compile and post binaries of the library for most common use cases (Linux, Mac, Windows on standard processor platforms). If you have a special case, Node-Serialport will work, but it will compile the binary when you install. `node-gyp` requires Python 2.x, so please ensure you have it installed and in your path for all operating systems. Python 3.x will not work.

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

> serialport@4.0.3 install /usr/lib/node_modules/serialport
> node-pre-gyp install --fallback-to-build

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

<a name="exp_module_serialport--SerialPort"></a>

### SerialPort ⏏
**Kind**: Exported class  
**Emits**: [<code>open</code>](#module_serialport--SerialPort+event_open), [<code>data</code>](#module_serialport--SerialPort+event_data), [<code>close</code>](#module_serialport--SerialPort+event_close), [<code>error</code>](#module_serialport--SerialPort+event_error)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| baudRate | <code>number</code> | The port's baudRate. Use `.update` to change it. Read-only. |
| binding | <code>object</code> | The binding object backing the port. Read-only. |
| isOpen | <code>boolean</code> | `true` if the port is open, `false` otherwise. Read-only. (`since 5.0.0`) |
| path | <code>string</code> | The system path or name of the serial port. Read-only. |


* * *

<a name="new_module_serialport--SerialPort_new"></a>

#### `new SerialPort(path, [options], [openCallback])`
Create a new serial port object for the `path`. In the case of invalid arguments or invalid options, when constructing a new SerialPort it will throw an error. The port will open automatically by default, which is the equivalent of calling `port.open(openCallback)` in the next tick. You can disable this by setting the option `autoOpen` to `false`.

**Throws**:

- <code>TypeError</code> When given invalid arguments, a `TypeError` will be thrown.


| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The system path of the serial port you want to open. For example, `/dev/tty.XXX` on Mac/Linux, or `COM1` on Windows. |
| [options] | [<code>openOptions</code>](#module_serialport--SerialPort..openOptions) | Port configuration options |
| [openCallback] | [<code>errorCallback</code>](#module_serialport--SerialPort..errorCallback) | Called after a connection is opened. If this is not provided and an error occurs, it will be emitted on the port's `error` event. The callback will NOT be called if `autoOpen` is set to `false` in the `openOptions` as the open will not be performed. |


* * *

<a name="module_serialport--SerialPort+open"></a>

#### `serialPort.open([callback])`
Opens a connection to the given serial port.

**Kind**: instance method of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  
**Emits**: [<code>open</code>](#module_serialport--SerialPort+event_open)  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | [<code>errorCallback</code>](#module_serialport--SerialPort..errorCallback) | Called after a connection is opened. If this is not provided and an error occurs, it will be emitted on the port's `error` event. |


* * *

<a name="module_serialport--SerialPort+update"></a>

#### `serialPort.update([options], [callback])`
Changes the baud rate for an open port. Throws if you provide a bad argument. Emits an error or calls the callback if the baud rate isn't supported.

**Kind**: instance method of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>object</code> | Only supports `baudRate`. |
| [options.baudRate] | <code>number</code> | The baud rate of the port to be opened. This should match one of the commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, or 115200. Custom rates are supported best effort per platform. The device connected to the serial port is not guaranteed to support the requested baud rate, even if the port itself supports that baud rate. |
| [callback] | [<code>errorCallback</code>](#module_serialport--SerialPort..errorCallback) | Called once the port's baud rate changes. If `.update` is called without a callback, and there is an error, an error event is emitted. |


* * *

<a name="module_serialport--SerialPort+write"></a>

#### `serialPort.write(data, [encoding], [callback])` ⇒ <code>boolean</code>
Writes data to the given serial port. Buffers written data if the port is not open.

The write operation is non-blocking. When it returns, data might still not have been written to the serial port. See `drain()`.

Some devices, like the Arduino, reset when you open a connection to them. In such cases, immediately writing to the device will cause lost data as they wont be ready to receive the data. This is often worked around by having the Arduino send a "ready" byte that your Node program waits for before writing. You can also often get away with waiting around 400ms.

If a port is disconnected during a write, the write will error in addition to the `close` event.

From the [stream docs](https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback) write errors don't always provide the error in the callback, sometimes they use the error event.
> If an error occurs, the callback may or may not be called with the error as its first argument. To reliably detect write errors, add a listener for the 'error' event.

In addition to the usual `stream.write` arguments (`String` and `Buffer`), `write()` can accept arrays of bytes (positive numbers under 256) which is passed to `Buffer.from([])` for conversion. This extra functionality is pretty sweet.

**Kind**: instance method of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  
**Returns**: <code>boolean</code> - `false` if the stream wishes for the calling code to wait for the `'drain'` event to be emitted before continuing to write additional data; otherwise `true`.  
**Since**: 5.0.0  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>string</code> \| <code>array</code> \| <code>buffer</code> | Accepts a [`Buffer` ](http://nodejs.org/api/buffer.html) object, or a type that is accepted by the `Buffer` constructor (e.g. an array of bytes or a string). |
| [encoding] | <code>string</code> | The encoding, if chunk is a string. Defaults to `'utf8'`. Also accepts `'ascii'`, `'base64'`, `'binary'`, and `'hex'` See [Buffers and Character Encodings](https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings) for all available options. |
| [callback] | <code>function</code> | Called once the write operation finishes. Data may not yet be flushed to the underlying port. No arguments. |


* * *

<a name="module_serialport--SerialPort+read"></a>

#### `serialPort.read([size])` ⇒ <code>string</code> &#124; <code>Buffer</code> &#124; <code>null</code>
Request a number of bytes from the SerialPort. The `read()` method pulls some data out of the internal buffer and returns it. If no data is available to be read, null is returned. By default, the data is returned as a `Buffer` object unless an encoding has been specified using the `.setEncoding()` method.

**Kind**: instance method of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  
**Returns**: <code>string</code> \| <code>Buffer</code> \| <code>null</code> - The data from internal buffers  
**Since**: 5.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [size] | <code>number</code> | Specify how many bytes of data to return, if available |


* * *

<a name="module_serialport--SerialPort+close"></a>

#### `serialPort.close(callback)`
Closes an open connection.

If there are in progress writes when the port is closed the writes will error.

**Kind**: instance method of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  
**Emits**: [<code>close</code>](#module_serialport--SerialPort+event_close)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>errorCallback</code> | Called once a connection is closed. |


* * *

<a name="module_serialport--SerialPort+set"></a>

#### `serialPort.set([options], [callback])`
Set control flags on an open port. Uses [`SetCommMask`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363257(v=vs.85).aspx) for Windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for OS X and Linux.

**Kind**: instance method of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  
**Since**: 5.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>object</code> |  | All options are operating system default when the port is opened. Every flag is set on each call to the provided or default values. If options isn't provided default options is used. |
| [options.brk] | <code>Boolean</code> | <code>false</code> |  |
| [options.cts] | <code>Boolean</code> | <code>false</code> |  |
| [options.dsr] | <code>Boolean</code> | <code>false</code> |  |
| [options.dtr] | <code>Boolean</code> | <code>true</code> |  |
| [options.rts] | <code>Boolean</code> | <code>true</code> |  |
| [callback] | [<code>errorCallback</code>](#module_serialport--SerialPort..errorCallback) |  | Called once the port's flags have been set. |


* * *

<a name="module_serialport--SerialPort+get"></a>

#### `serialPort.get([callback])`
Returns the control flags (CTS, DSR, DCD) on the open port.
Uses [`GetCommModemStatus`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363258(v=vs.85).aspx) for Windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for mac and linux.

**Kind**: instance method of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | [<code>modemBitsCallback</code>](#module_serialport--SerialPort..modemBitsCallback) | Called once the modem bits are retrieved. |


* * *

<a name="module_serialport--SerialPort+flush"></a>

#### `serialPort.flush([callback])`
Flush discards data received but not read, and written but not transmitted by the operating system. For more technical details, see [`tcflush(fd, TCIOFLUSH)`](http://linux.die.net/man/3/tcflush) for Mac/Linux and [`FlushFileBuffers`](http://msdn.microsoft.com/en-us/library/windows/desktop/aa364439) for Windows.

**Kind**: instance method of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | [<code>errorCallback</code>](#module_serialport--SerialPort..errorCallback) | Called once the flush operation finishes. |


* * *

<a name="module_serialport--SerialPort+drain"></a>

#### `serialPort.drain([callback])`
Waits until all output data is transmitted to the serial port. After any pending write has completed it calls [`tcdrain()`](http://linux.die.net/man/3/tcdrain) or [FlushFileBuffers()](https://msdn.microsoft.com/en-us/library/windows/desktop/aa364439(v=vs.85).aspx) to ensure it has been written to the device.

**Kind**: instance method of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | [<code>errorCallback</code>](#module_serialport--SerialPort..errorCallback) | Called once the drain operation returns. |

**Example**  
Write the `data` and wait until it has finished transmitting to the target serial port before calling the callback. This will queue until the port is open and writes are finished.

```js
function writeAndDrain (data, callback) {
  port.write(data);
  port.drain(callback);
}
```

* * *

<a name="module_serialport--SerialPort+pause"></a>

#### `serialPort.pause()` ⇒
The `pause()` method causes a stream in flowing mode to stop emitting 'data' events, switching out of flowing mode. Any data that becomes available remains in the internal buffer.

**Kind**: instance method of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  
**Returns**: `this`  
**See**: module:serialport#resume  
**Since**: 5.0.0  

* * *

<a name="module_serialport--SerialPort+resume"></a>

#### `serialPort.resume()` ⇒
The `resume()` method causes an explicitly paused, `Readable` stream to resume emitting 'data' events, switching the stream into flowing mode.

**Kind**: instance method of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  
**Returns**: `this`  
**See**: module:serialport#pause  
**Since**: 5.0.0  

* * *

<a name="module_serialport--SerialPort+event_error"></a>

#### `Event: "error"`
The `error` event's callback is called with an error object whenever there is an error.

**Kind**: event emitted by [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  

* * *

<a name="module_serialport--SerialPort+event_open"></a>

#### `Event: "open"`
The `open` event's callback is called with no arguments when the port is opened and ready for writing. This happens if you have the constructor open immediately (which opens in the next tick) or if you open the port manually with `open()`. See [Useage/Opening a Port](#opening-a-port) for more information.

**Kind**: event emitted by [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  

* * *

<a name="module_serialport--SerialPort+event_data"></a>

#### `Event: "data"`
The `data` event puts the port in flowing mode. Data is emitted as soon as it's received. Data is a `Buffer` object with a varying amount of data in it. The `readLine` parser converts the data into string lines. See the [parsers](#module_serialport--SerialPort.parsers) section for more information on parsers, and the [Node.js stream documentation](https://nodejs.org/api/stream.html#stream_event_data) for more information on the data event.

**Kind**: event emitted by [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  

* * *

<a name="module_serialport--SerialPort+event_close"></a>

#### `Event: "close"`
The `close` event's callback is called with no arguments when the port is closed. In the case of a disconnect it will be called with a Disconnect Error object (`err.disconnected == true`). In the event of a close error (unlikely), an error event is triggered.

**Kind**: event emitted by [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  

* * *

<a name="module_serialport--SerialPort.Binding"></a>

#### `SerialPort.Binding` : [<code>BaseBinding</code>](#module_serialport--SerialPort..BaseBinding)
The `Binding` is how Node-SerialPort talks to the underlying system. By default, we auto detect Windows, Linux and OS X, and load the appropriate module for your system. You can assign `SerialPort.Binding` to any binding you like. Find more by searching at [npm](https://npmjs.org/).
  Prevent auto loading the default bindings by requiring SerialPort with:
  ```js
  var SerialPort = require('serialport/lib/serialport');
  SerialPort.Binding = MyBindingClass;
  ```

**Kind**: static property of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  
**Since**: 5.0.0  

* * *

<a name="module_serialport--SerialPort.parsers"></a>

#### `SerialPort.parsers` : <code>object</code>
The default `Parsers` are [Transform streams](https://nodejs.org/api/stream.html#stream_class_stream_transform) that parse data in different ways to transform incoming data.

 To use the parsers, you must create them and then pipe the Serialport to the parser. Be careful to only write to the SerialPort object and not the parser.

**Kind**: static property of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  
**Since**: 5.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ByteLength | <code>Class</code> | is a transform stream that emits data as a buffer after a specific number of bytes are received. |
| Delimiter | <code>Class</code> | is a transform stream that emits data each time a byte sequence is received. |
| Readline | <code>Class</code> | is a transform stream that emits data after a newline delimiter is received. |

**Example**  
```js
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('/dev/tty-usbserial1');
const parser = new Readline();
port.pipe(parser);
parser.on('data', console.log);
port.write('ROBOT PLEASE RESPOND\n');

// Creating the parser and piping can be shortened to
// const parser = port.pipe(new Readline());
```

To use the `ByteLength` parser, provide the length of the number of bytes:
```js
const SerialPort = require('serialport');
const ByteLength = SerialPort.parsers.ByteLength
const port = new SerialPort('/dev/tty-usbserial1');
const parser = port.pipe(new ByteLength({length: 8}));
parser.on('data', console.log);
```

To use the `Delimiter` parser, provide a delimiter as a string, buffer, or array of bytes:
```js
const SerialPort = require('serialport');
const Delimiter = SerialPort.parsers.Delimiter;
const port = new SerialPort('/dev/tty-usbserial1');
const parser = port.pipe(new Delimiter({ delimiter: Buffer.from('EOL') }));
parser.on('data', console.log);
```

To use the `Readline` parser, provide a delimiter (defaults to '\n'). Data is emitted as string controllable by the `encoding` option (defaults to `utf8`).
```js
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('/dev/tty-usbserial1');
const parser = port.pipe(Readline({ delimiter: '\r\n' }));
parser.on('data', console.log);
```

To use the `Ready` parser provide a byte start sequence. After the bytes have been received data events are passed through.
```js
const SerialPort = require('serialport');
const Ready = SerialPort.parsers.Ready;
const port = new SerialPort('/dev/tty-usbserial1');
const parser = port.pipe(Ready({ data: 'READY' }));
parser.on('ready', () => console.log('the ready byte sequence has been received'))
parser.on('data', console.log); // all data after READY is received
```

To use the `Regex` parser provide a regular expression to split the incoming text upon. Data is emitted as string controllable by the `encoding` option (defaults to `utf8`).
```js
const SerialPort = require('serialport');
const Regex = SerialPort.parsers.Regex;
const port = new SerialPort('/dev/tty-usbserial1');
const parser = port.pipe(Regex({ regex: /[\r\n]+/ }));
parser.on('data', console.log);
```

* * *

<a name="module_serialport--SerialPort.list"></a>

#### `SerialPort.list([callback])` ⇒ <code>Promise</code>
Retrieves a list of available serial ports with metadata. Only the `comName` is guaranteed. If unavailable the other fields will be undefined. The `comName` is either the path or an identifier (eg `COM1`) used to open the SerialPort.

We make an effort to identify the hardware attached and have consistent results between systems. Linux and OS X are mostly consistent. Windows relies on 3rd party device drivers for the information and is unable to guarantee the information. On windows If you have a USB connected device can we provide a serial number otherwise it will be `undefined`. The `pnpId` and `locationId` are not the same or present on all systems. The examples below were run with the same Arduino Uno.

**Kind**: static method of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  
**Returns**: <code>Promise</code> - Resolves with the list of available serial ports.  

| Param | Type |
| --- | --- |
| [callback] | <code>listCallback</code> | 

**Example**  
```js
// OSX example port
{
  comName: '/dev/tty.usbmodem1421',
  manufacturer: 'Arduino (www.arduino.cc)',
  serialNumber: '752303138333518011C1',
  pnpId: undefined,
  locationId: '14500000',
  productId: '0043',
  vendorId: '2341'
}

// Linux example port
{
  comName: '/dev/ttyACM0',
  manufacturer: 'Arduino (www.arduino.cc)',
  serialNumber: '752303138333518011C1',
  pnpId: 'usb-Arduino__www.arduino.cc__0043_752303138333518011C1-if00',
  locationId: undefined,
  productId: '0043',
  vendorId: '2341'
}

// Windows example port
{
  comName: 'COM3',
  manufacturer: 'Arduino LLC (www.arduino.cc)',
  serialNumber: '752303138333518011C1',
  pnpId: 'USB\\VID_2341&PID_0043\\752303138333518011C1',
  locationId: 'Port_#0003.Hub_#0001',
  productId: '0043',
  vendorId: '2341'
}
```

```js
var SerialPort = require('serialport');
// callback approach
SerialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});

// promise approach
SerialPort.list()
  .then(ports) {...});
  .catch(err) {...});
```

* * *

<a name="module_serialport--SerialPort..BaseBinding"></a>

#### SerialPort~BaseBinding
You never have to use `Binding` objects directly. SerialPort uses them to access the underlying hardware. This documentation is geared towards people who are making bindings for different platforms. This class can be inherited from to get type checking for each method.

**Kind**: inner class of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  
**Since**: 5.0.0  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| isOpen | <code>boolean</code> | Required property. `true` if the port is open, `false` otherwise. Should be read-only. |


* [~BaseBinding](#module_serialport--SerialPort..BaseBinding)
    * [`new BaseBinding(options)`](#new_module_serialport--SerialPort..BaseBinding_new)
    * _instance_
        * [`.open(path, openOptions)`](#module_serialport--SerialPort..BaseBinding+open) ⇒ <code>Promise</code>
        * [`.close()`](#module_serialport--SerialPort..BaseBinding+close) ⇒ <code>Promise</code>
        * [`.read(data, offset, length)`](#module_serialport--SerialPort..BaseBinding+read) ⇒ <code>Promise</code>
        * [`.write(data)`](#module_serialport--SerialPort..BaseBinding+write) ⇒ <code>Promise</code>
        * [`.update([options])`](#module_serialport--SerialPort..BaseBinding+update) ⇒ <code>Promise</code>
        * [`.set([options])`](#module_serialport--SerialPort..BaseBinding+set) ⇒ <code>Promise</code>
        * [`.get()`](#module_serialport--SerialPort..BaseBinding+get) ⇒ <code>Promise</code>
        * [`.flush()`](#module_serialport--SerialPort..BaseBinding+flush) ⇒ <code>Promise</code>
        * [`.drain()`](#module_serialport--SerialPort..BaseBinding+drain) ⇒ <code>Promise</code>
    * _static_
        * [`.list()`](#module_serialport--SerialPort..BaseBinding.list) ⇒ <code>Promise</code>


* * *

<a name="new_module_serialport--SerialPort..BaseBinding_new"></a>

##### `new BaseBinding(options)`
**Throws**:

- <code>TypeError</code> When given invalid arguments, a `TypeError` is thrown.


| Param | Type |
| --- | --- |
| options | <code>object</code> | 


* * *

<a name="module_serialport--SerialPort..BaseBinding+open"></a>

##### `baseBinding.open(path, openOptions)` ⇒ <code>Promise</code>
Opens a connection to the serial port referenced by the path.

**Kind**: instance method of [<code>BaseBinding</code>](#module_serialport--SerialPort..BaseBinding)  
**Returns**: <code>Promise</code> - Resolves after the port is opened and configured.  
**Throws**:

- <code>TypeError</code> When given invalid arguments, a `TypeError` is thrown.


| Param | Type |
| --- | --- |
| path | <code>string</code> | 
| openOptions | [<code>openOptions</code>](#module_serialport--SerialPort..openOptions) | 


* * *

<a name="module_serialport--SerialPort..BaseBinding+close"></a>

##### `baseBinding.close()` ⇒ <code>Promise</code>
Closes an open connection

**Kind**: instance method of [<code>BaseBinding</code>](#module_serialport--SerialPort..BaseBinding)  
**Returns**: <code>Promise</code> - Resolves once the connection is closed.  
**Throws**:

- <code>TypeError</code> When given invalid arguments, a `TypeError` is thrown.


* * *

<a name="module_serialport--SerialPort..BaseBinding+read"></a>

##### `baseBinding.read(data, offset, length)` ⇒ <code>Promise</code>
Request a number of bytes from the SerialPort. This function is similar to Node's [`fs.read`](http://nodejs.org/api/fs.html#fs_fs_read_fd_buffer_offset_length_position_callback) except it will always return at least one byte.

The in progress reads must error when the port is closed with an error object that has the property `canceled` equal to `true`. Any other error will cause a disconnection.

**Kind**: instance method of [<code>BaseBinding</code>](#module_serialport--SerialPort..BaseBinding)  
**Returns**: <code>Promise</code> - Resolves with the number of bytes read after a read operation.  
**Throws**:

- <code>TypeError</code> When given invalid arguments, a `TypeError` is thrown.


| Param | Type | Description |
| --- | --- | --- |
| data | <code>buffer</code> | Accepts a [`Buffer`](http://nodejs.org/api/buffer.html) object. |
| offset | <code>integer</code> | The offset in the buffer to start writing at. |
| length | <code>integer</code> | Specifies the maximum number of bytes to read. |


* * *

<a name="module_serialport--SerialPort..BaseBinding+write"></a>

##### `baseBinding.write(data)` ⇒ <code>Promise</code>
Write bytes to the SerialPort. Only called when there is no pending write operation.

The in progress writes must error when the port is closed with an error object that has the property `canceled` equal to `true`. Any other error will cause a disconnection.

**Kind**: instance method of [<code>BaseBinding</code>](#module_serialport--SerialPort..BaseBinding)  
**Returns**: <code>Promise</code> - Resolves after the data is passed to the operating system for writing.  
**Throws**:

- <code>TypeError</code> When given invalid arguments, a `TypeError` is thrown.


| Param | Type | Description |
| --- | --- | --- |
| data | <code>buffer</code> | Accepts a [`Buffer`](http://nodejs.org/api/buffer.html) object. |


* * *

<a name="module_serialport--SerialPort..BaseBinding+update"></a>

##### `baseBinding.update([options])` ⇒ <code>Promise</code>
Changes connection settings on an open port. Only `baudRate` is supported.

**Kind**: instance method of [<code>BaseBinding</code>](#module_serialport--SerialPort..BaseBinding)  
**Returns**: <code>Promise</code> - Resolves once the port's baud rate changes.  
**Throws**:

- <code>TypeError</code> When given invalid arguments, a `TypeError` is thrown.


| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>object</code> | Only supports `baudRate`. |
| [options.baudRate] | <code>number</code> | If provided a baud rate that the bindings do not support, it should pass an error to the callback. |


* * *

<a name="module_serialport--SerialPort..BaseBinding+set"></a>

##### `baseBinding.set([options])` ⇒ <code>Promise</code>
Set control flags on an open port.

**Kind**: instance method of [<code>BaseBinding</code>](#module_serialport--SerialPort..BaseBinding)  
**Returns**: <code>Promise</code> - Resolves once the port's flags are set.  
**Throws**:

- <code>TypeError</code> When given invalid arguments, a `TypeError` is thrown.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>object</code> |  | All options are operating system default when the port is opened. Every flag is set on each call to the provided or default values. All options are always provided. |
| [options.brk] | <code>Boolean</code> | <code>false</code> |  |
| [options.cts] | <code>Boolean</code> | <code>false</code> |  |
| [options.dsr] | <code>Boolean</code> | <code>false</code> |  |
| [options.dtr] | <code>Boolean</code> | <code>true</code> |  |
| [options.rts] | <code>Boolean</code> | <code>true</code> |  |


* * *

<a name="module_serialport--SerialPort..BaseBinding+get"></a>

##### `baseBinding.get()` ⇒ <code>Promise</code>
Get the control flags (CTS, DSR, DCD) on the open port.

**Kind**: instance method of [<code>BaseBinding</code>](#module_serialport--SerialPort..BaseBinding)  
**Returns**: <code>Promise</code> - Resolves with the retrieved flags.  
**Throws**:

- <code>TypeError</code> When given invalid arguments, a `TypeError` is thrown.


* * *

<a name="module_serialport--SerialPort..BaseBinding+flush"></a>

##### `baseBinding.flush()` ⇒ <code>Promise</code>
Flush (discard) data received but not read, and written but not transmitted.

**Kind**: instance method of [<code>BaseBinding</code>](#module_serialport--SerialPort..BaseBinding)  
**Returns**: <code>Promise</code> - Resolves once the flush operation finishes.  
**Throws**:

- <code>TypeError</code> When given invalid arguments, a `TypeError` is thrown.


* * *

<a name="module_serialport--SerialPort..BaseBinding+drain"></a>

##### `baseBinding.drain()` ⇒ <code>Promise</code>
Drain waits until all output data is transmitted to the serial port. An in progress write should be completed before this returns.

**Kind**: instance method of [<code>BaseBinding</code>](#module_serialport--SerialPort..BaseBinding)  
**Returns**: <code>Promise</code> - Resolves once the drain operation finishes.  
**Throws**:

- <code>TypeError</code> When given invalid arguments, a `TypeError` is thrown.


* * *

<a name="module_serialport--SerialPort..BaseBinding.list"></a>

##### `BaseBinding.list()` ⇒ <code>Promise</code>
Retrieves a list of available serial ports with metadata. The `comName` must be guaranteed, and all other fields should be undefined if unavailable. The `comName` is either the path or an identifier (eg `COM1`) used to open the serialport.

**Kind**: static method of [<code>BaseBinding</code>](#module_serialport--SerialPort..BaseBinding)  
**Returns**: <code>Promise</code> - resolves to an array of port [info objects](#module_serialport--SerialPort.list).  

* * *

<a name="module_serialport--SerialPort..errorCallback"></a>

#### `SerialPort~errorCallback` : <code>function</code>
A callback called with an error or null.

**Kind**: inner typedef of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  

| Param | Type |
| --- | --- |
| error | <code>error</code> | 


* * *

<a name="module_serialport--SerialPort..modemBitsCallback"></a>

#### `SerialPort~modemBitsCallback` : <code>function</code>
A callback called with an error or an object with the modem line values (cts, dsr, dcd).

**Kind**: inner typedef of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  

| Param | Type | Default |
| --- | --- | --- |
| error | <code>error</code> |  | 
| status | <code>object</code> |  | 
| [status.cts] | <code>boolean</code> | <code>false</code> | 
| [status.dsr] | <code>boolean</code> | <code>false</code> | 
| [status.dcd] | <code>boolean</code> | <code>false</code> | 


* * *

<a name="module_serialport--SerialPort..openOptions"></a>

#### `SerialPort~openOptions` : <code>Object</code>
**Kind**: inner typedef of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| autoOpen | <code>boolean</code> | <code>true</code> | Automatically opens the port on `nextTick`. |
| baudRate | <code>number</code> | <code>9600</code> | The baud rate of the port to be opened. This should match one of the commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, or 115200. Custom rates are supported best effort per platform. The device connected to the serial port is not guaranteed to support the requested baud rate, even if the port itself supports that baud rate. |
| dataBits | <code>number</code> | <code>8</code> | Must be one of these: 8, 7, 6, or 5. |
| highWaterMark | <code>number</code> | <code>16384</code> | The size of the read and write buffers defaults to 16k. |
| lock | <code>boolean</code> | <code>true</code> | Prevent other processes from opening the port. Windows does not currently support `false`. |
| stopBits | <code>number</code> | <code>1</code> | Must be one of these: 1 or 2. |
| parity | <code>string</code> | <code>&quot;none&quot;</code> | Must be one of these: 'none', 'even', 'mark', 'odd', 'space'. |
| rtscts | <code>boolean</code> | <code>false</code> | flow control setting |
| xon | <code>boolean</code> | <code>false</code> | flow control setting |
| xoff | <code>boolean</code> | <code>false</code> | flow control setting |
| xany | <code>boolean</code> | <code>false</code> | flow control setting |
| bindingOptions | <code>object</code> |  | sets binding-specific options |
| Binding | <code>module:serialport~Binding</code> |  | The hardware access binding. `Bindings` are how Node-Serialport talks to the underlying system. By default we auto detect Windows (`WindowsBinding`), Linux (`LinuxBinding`) and OS X (`DarwinBinding`) and load the appropriate module for your system. |
| bindingOptions.vmin | <code>number</code> | <code>1</code> | see [`man termios`](http://linux.die.net/man/3/termios) LinuxBinding and DarwinBinding |
| bindingOptions.vtime | <code>number</code> | <code>0</code> | see [`man termios`](http://linux.die.net/man/3/termios) LinuxBinding and DarwinBinding |


* * *

<a name="module_serialport--SerialPort..listCallback"></a>

#### `SerialPort~listCallback` : <code>function</code>
This callback type is called `requestCallback`.

**Kind**: inner typedef of [<code>SerialPort</code>](#exp_module_serialport--SerialPort)  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>error</code> |  |
| ports | <code>array</code> | an array of objects with port info |


* * *


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
