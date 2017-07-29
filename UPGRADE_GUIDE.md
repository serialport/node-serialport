Upgrading from 4.x to 5.x
-------------
5.x is a major rewrite to make node serialport a NodeJS stream. While the api surface is similar there have been a number of changes to ensure more consistent error handling and operation of a serial port.

- Removed the `disconnect` event. The `close` event now fires with a disconnect error object in the event of a disconnection.
- `drain` now waits for the current javascript write to complete before calling the system level drain.
- `port.isOpen` is now a property not a function
- `SerialPort.list` has slightly different output with more information, decoded strings and `0x` prefixes removed from some properties.
- `SerialPort.list` now returns a promise if no call back is provided

The exact changes will go here see #1046

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

