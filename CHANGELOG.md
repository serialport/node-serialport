Version 5.0.0 🎉
-------------
Nearly [a year in the making](https://github.com/EmergingTechnologyAdvisors/node-serialport/compare/4.0.7...5.0.0-beta9) Node SerialPort 5.0.0 is a major rewrite that improves stability, compatibility and performance. The api surface is similar to version 4 there have been a number of changes to ensure consistent error handling and operation of a serial port. Notably we are now a [`Stream`](https://nodejs.org/api/stream.html)! We can also introduce a bindings layer. A small low level api to provide access to underlying hardware. External bindings written in other languages or targeting other platforms can now be used.

Some major cpu performance gains on unix platforms can be found and we're less buggy and better performing on Windows too.

With this release we are now only supporting LTS nodejs platforms and we are dropping NodeJS 0.10, 0.12, 5 and 7 support. We loved directly supporting so many platforms but it was getting in the way making a solid library.

See our [upgrade guide](./UPGRADE_GUIDE.md) for detail on what to change to upgrade your app to use `serialport@5.0.0`. It's not much!

Thank you to the 25 people who committed code and documentation and every person who submitted bug reports and tested changes!

Notable Changes
- [all] Streams rewrite, node serialport is now a node stream! 🎉
- [all] Drop NodeJS 0.10, 0.12, 5, and 7 support
- [all] Add node 8 support (we now only support LTS node versions)
- [all] Introduce a binding layer to provide a common low level interface to work with different platforms.
- [unix] New read/write subsystem. Write CPU dropped from 100% to 0-2%. @reconbot (Thanks to @indutny for getting me unstuck many times!)
- [windows] Rewrite reading so it's pausable thanks to @munyirik
- [docs] An overhaul how we document the api leveraging JSDOC
- [docs] An overhaul of the format and language in our docs thanks to @LappleApple

Features
- [all] `isOpen` is now a property #899
- [all] `SerialPort.list` now has more consistent output across all platforms.
- [all] `SerialPort.list` returns a promise if a callback is not provided thanks to @MikeKovarik for bug fixes
- [all] A promise aware `serialport-repl` script for debugging and testing.
- [all] add `#get` to retrieve modem status flags thanks to @jgillick!
- [all] Add a `MockBinding` object for testing serialports in your project. Used internally too!
- [all] Add electron precompiled binaries thanks to @Mike-Dax
- [all] Add regex stream parser and tests @jessicaquynh
- [all] Allow reopening after an open error #910
- [all] calls to `.drain` now queue behind port open and in progress writes reported by and with lots of testing help from @tuna-f1sh
- [all] Change parsers to be transform streams #922
- [all] Change the default `highWaterMark` to 64k to match `fs.ReadStream`
- [all] Conform to NodeJS error message formats
- [all] Exposed mocking serialport via `require('serialport/test')`
- [all] Have drain wait for pending JS write operations before calling system drain thanks to @digitalhack for reporting it
- [all] port.path is now read only #898
- [all] Refactor internals to make use of es6 and promises
- [all] Remove lowercase options #898
- [all] Remove the c++ write queue
- [all] Remove unnecessary dependencies and polyfills thanks to @mscdex
- [all] Remove v8 deprecation warnings thanks to @indutny again
- [all] Removed the `disconnect` event. The `close` event now fires with a disconnect error object in the event of a disconnection.
- [all] SerialPort can now be compressed with `uglify-es` thanks to @rwaldron
- [all] update bindings to version 1.3.0
- [all] Upgrade debug and node-pre-gyp
- [all] Upgrade to non deprecated buffer methods
- [docs] Add more installation notes on sudo, windows 10, electron and node 7
- [docs] Add socketio example @jessicaquynh
- [docs] Electron build docs #965 via @chalkers
- [docs] Mark new features in 5.0.0 with the fact they started in 5.0.0
- [docs] Update parser docs to be correct #970 via @jacobq
- [linux] `SerialPort.list` is now faster and less resource intensive thanks to @akaJes!
- [linux] Add the `ttyAP` subsystem to serialport list thanks to @fly19890211 for reporting it
- [osx] `SerialPort.list` now returns the `tty` instead of the `cu` thanks to @kishinmanglani
- [unix] Flush now gives errors and flushes tx and rx #900
- [unix] Move setting up the baudrate to the end of the `open()` to better support custom baudrates
- [windows] Refactoring of `.list` for Windows so it's significantly smaller thanks to @Zensey

Fixes
- [all] Fix baud rate parsing in `serialport-terminal` thanks to @radio-miskovice for reporting it!
- [all] Fix memory leak during opening a port thanks to @indutny
- [all] fixed a crash when pausing while reading thanks to @bminer and @baffo32 and others to debug and fix this
- [all] Upgrade nan to fix compile issues on some platforms thanks to @thom-nic
- [docs] fixed a typo thanks to @amilajack
- [docs] Spelling fixes via @Awk34
- [unix] fix a bug when poller errors would be unhandled thanks to @thiago-sylvain for reporting
- [windows] Fix file handle leak during opens when errors occur thanks to @enami
- [windows] Fix flush behavior using PurgeComm fixing #962 via @samisaham
- [windows] Fix unhandled promise rejection when calling read on Windows
- [windows] Remove read and write timeouts solving #781 via @giseburt

We also had help testing, debugging, and designing from; @alaq @arve0 @techninja @noopkat @HipsterBrown and more!

Version 4.0.7
-------------
- [all] Fix baud rate parsing in `serialport-terminal` thanks to @radio-miskovice for reporting it!
- [windows] Refactor `SerialPort.list` to be a lot smaller and pickup vendorId, productId and locationId thanks to @zensey for #877!

Version 4.0.6
-------------
- [all] Upgrade nan to fix compile issues on some platforms thanks to @thom-nic
- [all] Upgrade debug and node-pre-gyp

Version 4.0.5
-------------
- [windows] Fix file handle leak during opens when errors occur thanks to @enami
- [all] Fix memory leak during opening a port thanks to @indutny

Version 4.0.4
-------------
- Add precompiled binaries for node 7

Version 4.0.3
-------------
- Switch to the lie promise library as it's smaller and mimics nodejs's promise closer
- Fix a bug that prevented reopening a port after an open error

Version 4.0.2
-------------
- [unix] Fix a bug when we'd crash when pausing during a read

Version 4.0.1
-------------
- [linux] Do not replace the native Promise when it is available thanks to @zewish for the fix

Version 4.0.0
-------------
- Requiring `serialport` now returns the SerialPort constructor function instead of a factory object. `SerialPort.SerialPort` is now deprecated.
- `SerialPort` constructor now throws on argument errors immediately.
- `.write(writeCallback)` now only calls it's callback once after the entire write operation, it used to be called for each write cycle and return the bytes written. This reduces the number of callbacks by hundreds of thousands over a megabyte at low bandwidth.
- Disconnections now always attempt to close the port, and you'll always get a `close` event after a `disconnect` event
- All callbacks are called in the context of the port, `this` now equals the port.
- Removed `openImmediately` from the constructor's api, the functionality is now named `autoOpen` on the options object.
- Removed extraneous flow control settings from the `flowControl` option, use the specific options to set these flags now.
- Removed undocumented callbacks from the options object `disconnectedCallback` and `dataCallback`
- Renamed `serialportlist` to `serialport-list`
- Renamed `serialportterm` to `serialport-term`
- Added a contributors guide
- Added our first Arduino required integration tests
- [unix] `.drain` and `.set` now properly report errors
- [unix] Ports are now locked by default with the new `lock` options matches windows default behavior
- [windows] `.update()` now supports windows for changing baud rates
- [windows] Fixed a bug where we weren't properly opening ports (provides better support virtual com ports too) thanks to @RogerHardiman
- [windows] known issue `lock: false` doesn't work (no change in behavior)

Version 3.1.2
-------------
- Documentation around "Illegal Instruction" errors
- Resolve some ambiguities around publishing that was causing some issues on some versions and platforms of npm and node
- [linux] bug fix in `.list()` where we weren't filtering out non block devices that are named like serial ports
- [unix] Better unix error messages
- [unix] Refactor `setBaudrate` for Unix making it easier for custom baudRate support
- [unix] Update now has less memory leaks, documentation and better error messages
- [windows] Better error messages for opening ports

Version 3.1.1
-------------
- fix an issue with bundled deps for node-pre-gyp on npm

Version 3.1.0
-------------
- Upgrade nan and fix warnings for node 6.0
- Update the cli tools. serialport-term can now list ports, serialport-list can now output in different formats

Version 3.0.1
-------------
- Change from BlueBird to es6-promise to save 9.5MB from the package size (19M -> 9.5) and 130k bundle size (186.1kb -> 55.2kb)
- Experimental node 6 support

Version 3.0.0
-------------
- `close` and `disconnect` events no longer call `removeAllListeners` and removes your event listeners. This was particularly bad for the `error` event. This is the only change and if you didn't have a special code to deal with this behavior you should probably upgrade from v2.1.2

Version 2.1.2
-------------
- Start bundling node-pre-gyp but upgrade it to the latest as the previous version doesn't install

Version 2.1.1
-------------
- `.list` errors are consistent across platforms and no longer has blocking `statSync` calls
- Stop bundling node-pre-gyp to prevent issues when it's already installed
- Internal restructuring

Version 2.1.0
-------------
- Major refactor, bug fixes and docs improvements thanks to @ecksun, @fivdi, @gfcittolin, @jacobrosenthal, @mhart, @nebrius, @pabigot, @paulkaplan, @reconbot, @rodovich, @rwaldron, @sayanee, @tigoe and everyone who reported and helped debug issues!
- Fix binary paths to confirm with modern standards
- Integration tests on CI's that support it or for the folks at home with an arduino handy
- Upgrade to nan-2.2.1 for memory leak fixes and node 6 compatibility (still not supported)
- Confirm nw.js and electron compatibility
- Make the outpout of `.list` consistent between platforms and docs
- Define ambiguous flow control flags and document them
- Fix support systems who provide 0 as a valid file descriptor
- Fix race conditions when opening and closing ports that led to errors while reading and writing while closing or opening the port.
- [unix] Fix a double open bug on unix that would cause opening and closing ports repetitively to error.
- [unix] Listing serialports on linux now include more ports (including bluetooth devices eg. `/dev/rfcommXX`) and have less bugs in the output
- [windows] Remove deprecated BuildCommDCB for windows 10 support
- [windows] Fix a memory leak on windows
- [windows] Fix a 100% cpu and possible hang bug when ports were disconnected on windows.

Version 2.0.6
-------------
- Add 5.x build to matrix, thanks @deadprogram
- Re add nmpignore, thanks @rwaldron
- Swap to upstream version of node-pre-gyp-github

Version 2.0.5
-------------
- Fix linux port listing crash since 2.0.3 refactor, thanks @monkbroc

Version 2.0.4
-------------
- Fix heap corruption issue affecting windows users since 2.0.0, thanks @kunalspathak

Version 2.0.3
-------------
- Move node-pre-gyp binaries away from Amazon S3 to Github Releases page
- Fix for missing node-pre-gyp binaries, especially for windows users, since the 2.0.0 refactor which forced windows users to build from source -- generally failing due to lack of dependencies
- Unix port listing moved away from udev which was not available on all platforms, to whitelisting ttyS ttyACM ttyUSB ttyAMA devices, see #610

Version 2.0.2
-------------
- Cleanup minor Unix gcc warnings, Thanks @rwaldron

Version 2.0.1
-------------
- El Capitan Support, thanks @tmpvar

Version 2.0.0
-------------
- Upgrade to NAN2 to support Node 4 support. Technically not api breaking, though NAN2 requires gcc 4.8 which for Pi Wheezy users at the very least, would be breaking. For those affected users looking to utilize serialport 2.x.x and Node 4 see https://github.com/fivdi/onoff/wiki/Node.js-v4-and-native-addons

Version 1.7.4
-------------
- Fix OSX 10.10 build errors

Version 1.7.3
-------------
- Fix OSX 10.10 build errors

Version 1.7.2
-------------
- Fix OSX 10.10 build errors

Version 1.7.1
-------------
- Fixed breaking issues in underlying code. (@voodootikigod)

Version 1.7.0
-------------
- Fix for #518 and #498 If you pass to SerialPort function (constructor) the same object for argument "options", inside SerialPort will use it as internal object and adds handlers to it. That causes only one callback to work on different SerialPort instances. (@bullmastiffo)
- Update README.md #515 (@arahlf)
- Fix a memory leak in SerialportPoller::New (@jpilet)
- unix support for update baudrate #502 (@jacobrosenthal)
- set cloexec after open, possible fix for #468 (@jacobrosenthal)
- Added hang up on close option to constructor. #495 (@jbendes)
- Upgraded NAN to 1.8.4 due to complaints from io.js 2.x users. (@imyller)

Version 1.6.1
-------------
- Upgraded to NAN 1.7.0
- #476 adding break signal

Version 1.6.0
-------------
- Long standing issue resolved thanks to @jacobrosenthal for adding control signals into the serialport. YAY!
- Fix for #426
- Ability to return from inside loop #453
- Emits for close/disconnect. #452

Version 1.5.0
-------------
- Fixed to work with io.js and node 0.11.x by upgrading to recent nan 1.6.2


Version 1.4.8
-------------
- Simple bump for the binary.

Version 1.4.7
-------------
- Fix for Issue #398 - Dropped sent characters on OSX and Linux
- Fix for Issue #387 - added isOpen
- removed a residual comment
- Added osx control signalling
- Fix for Issue #401
- Fix for double write callbacks.
- detect a serialport disconnect on linux.

Version 1.4.6
-------------
- Emit error on serialport when explicit handler present. Fixes gh-369
- Fix for windows and Node 0.11.13 (atom-shell)
- Fix for broken Travis-CI build.

Version 1.4.5
-------------
- Identified and report issue to node.js core about recent 0.11.x system.
- Removed support for 0.8.x
- Updated dependencies

Version 1.4.4
-------------
- Fix for delete error.

Version 1.3.0
-------------
- Merged NAN integration for Node 0.8->0.11+ compatibility (#270)

Version 1.2.5
-------------
- Fixed an issue with pool handlers being global instead of instance isolation (Issue #252 and #255 thanks: foobarth !!! )


Version 1.2.4
-------------
- Resolved parity error under linux as reported here: https://github.com/voodootikigod/node-serialport/issues/219


Version 1.1.3
-------------
- Remove ATL dependency on Windows (added Visual Studio Pro requirement)
- Update build instructions
- Four small bugfixes

Version 1.0.7
-------------
- Guaranteed in-order delivery of messages thanks to Jay Beavers and bnoordhuis

Version 1.0.6
-------------
- Support higher baud rates in Mac OS X

Version 1.0.5
-------------
- Added flush support.

Version 1.0.4
-------------
- Fix for arduino firmata support on windows thanks to @jgautier.

Version 1.0.3
-------------
- Fixed issue 65 - https://github.com/voodootikigod/node-serialport/issues/65
- Added note in readme about what is required for the system to be able to compile module, should solve 90% of issues.

Version 1.0.2
-------------
- Fixed issue 59 - https://github.com/voodootikigod/node-serialport/issues/59

Version 1.0.1
-------------
- Fixed items from Firmata
- Added flexibility for options (camelcase or all lower)

Version 1.0.0
-------------
- Added Windows support thanks to Joe Ferner.
- Merged in the various underlying changes from node-serialport2 complete thanks to Joe Ferner for that!
- Verified against known installations.


Version 0.6.5
-------------
- Added SetBaudRate, SetDTR; Custom Baud Rates
- New "close" listener when device being disconnected

Version 0.2.8
-------------
- BufferSize fix for readstream (thanks jgautier, you rock)

Version 0.2.7
-------------
- Make no port available be an exception not error emitted - Ticket #12.

Version 0.2.5 - Version 0.2.6
-----------------------------
- Debugging issue with IOWatcher not holding in the event loop in node.js.
- Converted to ReadStream instead of IOWatcher.

Version 0.2.4
-------------
- Integrated arduino tests (rwaldron)
- Integrated options bug fix (w1nk)
- Integrated hardware flow control for crazier serial port action (w1nk)

Version 0.2.3
-------------
- Something amazing that has since been lost and forgotten.

Version 0.2.2
-------------
- Integrated enhanced version of arduino/readline that actually buffers the data (epeli)

Version 0.2.1
-------------
- Refactored the parsing code upon data receipt, now allows for dynamic specification of how incoming data is handled.
- Revised creation interface to use named parameters as an object versions positional parameters.

Version 0.2.0
------------
- Upgraded to node v. 0.4.X compatibility

All other version are not recorded.
