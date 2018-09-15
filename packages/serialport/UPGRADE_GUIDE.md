Upgrading from 7.x to 8.x
-------------
- Serialport cli tools are now their own packages. See https://serialport.io/docs/guide-cli for more information on how to use them.


Upgrading from 6.x to 7.x
-------------
We dropped support for Node.js 4, so you'll have to upgrade if you're running 4. We also split into many packages. See https://serialport.io/docs/api-overview for an overview of the new packages. Binaries have moved into `@serialport/bindings` so if you're distributing serialport in an electron app, you may have to make some changes.

Upgrading from 5.x to 6.x
-------------
TLDR: You probably don't have to change anything. You might need to enable `rtscts` in your open options.

* **binaries:** We switched to `prebuild` a breaking change because it's substantially changes our install processes. It's also possible the install flags to ensure downloading or building from source has changed slightly. That's not our api per se, but it's enough for a breaking change.
* **windows:** We previously hard coded to have RTS on for windows at all times it now default to off.


Upgrading from 4.x to 5.x
-------------
Node SerialPort 5.0.0 is a major rewrite that improves stability, compatibility and performance. While the api surface is similar there have been a number of changes to ensure consistent error handling and operation of a serial port.

### Platforms
- Drop NodeJS 0.10, 0.12, 5, and 7 support
- Add node 8 support (we now only support LTS node versions)

### The SerialPort Object
- Node SerialPort is now a [duplex stream](https://nodejs.org/api/stream.html) and can be paused and resumed on all platforms.
- `isOpen` is now a property
- `SerialPort.list` now has more consistent output across all platforms. This means the data in the objects may be different than 4x. Notably the path on OSX now returns the `tty` instead of the `cu` path and the `0x` has been removed from values on linux and osx.
- `port.path` is now read only
- removed lowercase options all options are now only accepted camelCase
- Changed parsers to be transform streams. There are replacements for the built in parsers but custom parsers will have to be modified.

### Open options
- `bufferSize` is now `highWaterMark` and defaults to 64k.
- `parser` is removed in favor of using the new transform streams parsers

### Opening and closing
- Removed the `disconnect` event. The `close` event now fires with a disconnect error object in the event of a disconnection.
- `port.isOpen` is now a property not a function

### Reading and writing.
- `port.on('data')` still works but `port.read()` and the `readable` event is now the preferred way to get data.
- `port.read()` is now the best way to read data
- `port.drain()` now waits for the current javascript write to complete before calling the system level drain.

### Other
- We now conform to NodeJS error message formats. Most messages have changed.
- The event loop is no longer held open if there are no active reads or writes
- `SerialPort.list` has slightly different output with more information, decoded strings and `0x` prefixes removed from some properties.
- `SerialPort.list` now returns a promise if no call back is provided

Upgrading from 3.x to 4.x
-------------
4.x brings a lot of changes please see the [changelog](./changelog.md) for the full list of changes. We'll review the api and behavior changes here.

The constructor has changed. We've removed an argument, changed how errors are thrown and it is returned when you `require('serialport');`

 - Requiring `serialport` now returns the SerialPort constructor function instead of a factory object. `SerialPort.SerialPort` is now deprecated.
 - `SerialPort` constructor now throws on argument errors immediately.
 - Removed `openImmediately` from the constructor's api, the functionality is now named `autoOpen` on the options object.
 - Removed extraneous flow control settings from the `flowControl` option, use the specific options to set these flags now.
 - Removed undocumented callbacks from the options object `disconnectedCallback` and `dataCallback`

 Write had a major change

  - `.write(writeCallback)` now only calls it's callback once after the entire write operation, it used to be called for each write cycle and return the bytes written. This reduces the number of callbacks by hundreds of thousands over a megabyte at low bandwidth.

Callbacks changed a little

 - All callbacks are called in the context of the port, `this` now equals the port.
 - Disconnections now always attempt to close the port, and you'll always get a `close` event after a `disconnect` event

Renamed our binaries

 - Reanmed `serialportlist` to `serialport-list`
 - Renamed `serialportterm` to `serialport-term`

We fixed a bunch of bugs too

 - [unix] `.drain` and `.set` now properly report errors
 - [windows] Fixed a bug where we weren't properly opening ports (provides better support virtual com ports too) thanks to @RogerHardiman
 - [windows] known issue `lock` false doesn't work (no change in behavior)

And added a new features

 - [unix] Ports are now locked by default with the new `lock` options matches windows default behavior
 - [windows] `.update()` now supports windows for changing baud rates

Upgrading from 2.x to 3.x
-------------
3.0 brought a single major breaking change and a lot of minor improvements.

We stopped removing event listeners, if you wrote code to work around that, we're sorry we made you do it.

- `close` and `disconnect` events no longer call `removeAllListeners` and removes your event listeners. This was particularly bad for the `error` event. This is the only change and if you didn't have a special code to deal with this behavior you should probably upgrade from v2.1.2

New Features

 - Added support for node 6.0
 - Update the cli tools. serialportterm can now list ports, serialportlist can now output in different formats
 - [unix] Better unix error messages

Fixed bugs

 - [linux] bug fix in `.list()` where we weren't filtering out non block devices that are named like serial ports
 - [unix] Update now has less memory leaks, documentation and better error messages
 - [windows] Better error messages for opening ports

