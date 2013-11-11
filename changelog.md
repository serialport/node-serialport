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