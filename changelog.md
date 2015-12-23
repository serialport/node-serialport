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

Version: 0.2
------------
- Upgraded to node v. 0.4.X compatibility

All other version are not recorded.