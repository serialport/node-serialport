[![Build Status](https://travis-ci.org/voodootikigod/node-serialport.png?branch=master)](https://travis-ci.org/voodootikigod/node-serialport)
[![Gitter chat](https://badges.gitter.im/voodootikigod/node-serialport.png)](https://gitter.im/voodootikigod/node-serialport)
[![Dependency Status](https://david-dm.org/voodootikigod/node-serialport.png)](https://david-dm.org/voodootikigod/node-serialport)

For all discussions, designs, and clarifications, we recommend you join our Gitter Chat room: [https://gitter.im/voodootikigod/node-serialport](https://gitter.im/voodootikigod/node-serialport)


*****

Imagine a world where you can write JavaScript to control blenders, lights, security systems, or even robots. Yes, I said robots. That world is here and now with node-serialport. It provides a very simple interface to the low level serial port code necessary to program [Arduino](http://www.arduino.cc/) chipsets, [X10](http://www.smarthome.com/manuals/protocol.txt) wireless communications, or even the rising [Z-Wave](http://www.z-wave.com/modules/ZwaveStart/) and [Zigbee](http://www.zigbee.org/) standards. The physical world is your oyster with this goodie. For a full break down of why we made this, please read [NodeBots - The Rise of JS Robotics](http://www.voodootikigod.com/nodebots-the-rise-of-js-robotics).

*****

For getting started with node-serialport, we recommend you begin with the following articles:

* [Arduino Node Security Sensor Hacking](http://nexxylove.tumblr.com/post/20159263403/arduino-node-security-sensor-hacking) - A great all around "how do I use this" article.
* [NodeBots - The Rise of JS Robotics](http://www.voodootikigod.com/nodebots-the-rise-of-js-robotics) - A survey article of why one would want to program robots in JS.
* [Johnny-Five Getting Started Guide](https://github.com/rwldrn/johnny-five#setup-and-assemble-arduino) - Introduction to using the high level Johnny-Five library (awesome).


To Install
----------

For most "standard" use cases (node v0.10.x on mac, linux, windows on a x86 or x64 processor), node-serialport will install nice and easy with a simple

```
npm install serialport
```

### Installation Special Cases

We are using [node-pre-gyp](https://github.com/mapbox/node-pre-gyp) to compile and post binaries of the library for most common use cases (linux, mac, windows on standard processor platforms). If you are on a special case, node-serialport will work, but it will compile the binary when you install. 

This assumes you have everything on your system necessary to compile ANY native module for Node.js. This may not be the case, though, so please ensure the following are true for your system before filing an issue about "Does not install". For all operatings systems, please ensure you have Python 2.x installed AND not 3.0, node-gyp (what we use to compile) requires Python 2.x.

#### Windows:

 * Windows 7 or Windows 8.1 are supported.
 * Install [Visual Studio Express 2013 for Windows Desktop](http://www.microsoft.com/visualstudio/eng/2013-downloads#d-2013-express).
 * If you are hacking on an Arduino, be sure to install [the drivers](http://arduino.cc/en/Guide/windows#toc4).
 * Install [node.js](http://nodejs.org/) matching the bitness (32 or 64) of your operating system.
 * Install [Python 2.7.6](http://www.python.org/download/releases/2.7.6/) matching the bitness of your operating system.  For any questions, please refer to their [FAQ](http://docs.python.org/2/faq/windows.html). Default settings are perfect.
 * Open the 'Visual Studio Command Prompt' and add Python to the path.

#### Mac OS X:

Ensure that you have at a minimum the xCode Command Line Tools installed appropriate for your system configuration. If you recently upgraded the OS, it probably removed your installation of Command Line Tools, please verify before submitting a ticket.

#### Desktop (Debian/Ubuntu) Linux:

You know what you need for you system, basically your appropriate analog of build-essential. Keep rocking! Ubuntu renamed the `node` binary `nodejs` which can cause problems building `node-serialport`. The fix is simple, install the [nodejs-legacy package](https://packages.debian.org/sid/nodejs-legacy) that symlinks `/usr/bin/nodejs => /usr/bin/node` or install the more up to date nodejs package from [Chris Lea's PPA](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#ubuntu-mint-elementary-os).


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

#### Raspberry Pi Linux:

 * Starting with a a vanilla New Out of the Box Software (NOOBS) Raspbian image
 * Log into your Raspberry Pi through whatever means works best and ensure you are on a terminal prompt for the remaining steps. This could be local or through an SSH (or a serial connection if you like).
 * Issue the following commands to ensure you are up to date:

```bash
   sudo apt-get update
   sudo apt-get upgrade -y
```

 * Download and install node.js:

```bash
   wget https://node-arm.herokuapp.com/node_archive_armhf.deb
   sudo dpkg -i node_archive_armhf.deb
```

More information can be found at [node-arm](http://node-arm.herokuapp.com/).

 * Install using npm, note this will take a while as it is actually compiling code and that ARM processor is getting a workout.

```bash
   npm install serialport
```

To Use
------

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

open event
----------

You MUST wait for the open event to be emitted before reading/writing to the serial port. The open happens asynchronously so installing 'data' listeners and writing
before the open event might result in... nothing at all.

Assuming you are connected to a serial console, you would for example:

```js
serialPort.on("open", function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
  });
  serialPort.write("ls\n", function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });
});
```

You can also call the open function, in this case instantiate the serialport with an additional flag.

```js
var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/tty-usbserial1", {
  baudrate: 57600
}, false); // this is the openImmediately flag [default is true]

serialPort.open(function (error) {
  if ( error ) {
    console.log('failed to open: '+error);
  } else {
    console.log('open');
    serialPort.on('data', function(data) {
      console.log('data received: ' + data);
    });
    serialPort.write("ls\n", function(err, results) {
      console.log('err ' + err);
      console.log('results ' + results);
    });
  }
});
```

List Ports
----------

You can also list the ports along with some metadata as well.

```js
var serialPort = require("serialport");
serialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});
```

Parsers
-------

Out of the box, node-serialport provides two parsers one that simply emits the raw buffer as a data event and the other which provides familiar "readline" style parsing. To use the readline parser, you must provide a delimiter as such:

```js
var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

var sp = new SerialPort("/dev/tty-usbserial1", {
  parser: serialport.parsers.readline("\n")
});
```

To use the raw parser, you just provide the function definition (or leave undefined):

```js
var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

var sp = new SerialPort("/dev/tty-usbserial1", {
  parser: serialport.parsers.raw
});
```


You can get updates of new data from the Serial Port as follows:

```js
serialPort.on("data", function (data) {
  sys.puts("here: "+data);
});
```

You can write to the serial port by sending a string or buffer to the write method as follows:

```js
serialPort.write("OMG IT WORKS\r");
```

Enjoy and do cool things with this code.

Reference Guide
---------------

## Methods

### SerialPort (path, options, openImmediately, callback)

Create a new serial port on `path`.

**_path_**

The system path of the serial port to open. For example, `/dev/tty` on Mac/Linux or `COM1` on Windows.

**_options (optional)_**

Port configuration options.

* `baudRate` Baud Rate, defaults to 9600. Should be one of: 115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300, 200, 150, 134, 110, 75, or 50. Custom rates as allowed by hardware is supported.
* `dataBits` Data Bits, defaults to 8. Must be one of: 8, 7, 6, or 5.
* `stopBits` Stop Bits, defaults to 1. Must be one of: 1 or 2.
* `parity` Parity, defaults to 'none'. Must be one of: 'none', 'even', 'mark', 'odd', 'space'
* `rtscts`
* `xon`
* `xoff`
* `xany`
* `flowControl`
* `bufferSize` Size of read buffer, defaults to 255. Must be an integer value.
* `parser` The parser engine to use with read data, defaults to rawPacket strategy which just emits the raw buffer as a "data" event. Can be any function that accepts EventEmitter as first parameter and the raw buffer as the second parameter.
* `encoding`
* `dataCallback`
* `disconnectedCallback`
* `platformOptions` - sets platform specific options, see below.

**Note, we have added support for either all lowercase OR camelcase of the options (thanks @jagautier), use whichever style you prefer.**

#### Unix Platform Options

An object with the following properties:

* `vmin` (default: 1) - see [`man termios`](http://linux.die.net/man/3/termios)
* `vtime` (default: 0) - see [`man termios`](http://linux.die.net/man/3/termios)

**_openImmediately (optional)_**

Attempts to open a connection to the serial port on `process.nextTick`. The default is `true`. Set to `false` to manually call `open()` at a later time, but note you'll need to use factory error listener in the case of constructor errors.

**_callback (optional)_**

Called when a connection has been opened. The callback should be a function that looks like: `function (error) { ... }`

### .open (callback)

Opens a connection to the given serial port.

**_callback (optional)_**

Called when a connection has been opened. NOTE: Will NOT be called if openImmediately is set to false as open will not be performed. The callback should be a function that looks like: `function (error) { ... }`

### .isOpen()

Returns `true` if the port is open.

### .write (buffer, callback)

Writes data to the given serial port.

**_buffer_**

The `buffer` parameter accepts a [`Buffer` ](http://nodejs.org/api/buffer.html) object, or a type that is accepted by the `Buffer` constructor (ex. an array of bytes or a string).

**_callback (optional)_**

Called once the write operation returns. The callback should be a function that looks like: `function (error) { ... }` _Note: The write operation is non-blocking. When it returns, data may still have not actually been written to the serial port. See `drain()`._

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

Called once a connection is closed. Closing a connection will also remove all event listeners. The callback should be a function that looks like: `function (error) { ... }`

## Events

### .on('open', callback)

### .on('data', callback)

### .on('close', callback)

### .on('error', callback)

&nbsp;
&nbsp;

---

&nbsp;
&nbsp;

