<pre>
  eeeee eeeee eeeee eeee       e  eeeee 
  8   8 8  88 8   8 8          8  8   " 
  8e  8 8   8 8e  8 8eee       8e 8eeee 
  88  8 8   8 88  8 88      e  88    88 
  88  8 8eee8 88ee8 88ee 88 8ee88 8ee88

  eeeee eeee eeeee  e  eeeee e     eeeee eeeee eeeee eeeee 
  8   " 8    8   8  8  8   8 8     8   8 8  88 8   8   8   
  8eeee 8eee 8eee8e 8e 8eee8 8e    8eee8 8   8 8eee8e  8e  
     88 88   88   8 88 88  8 88    88    8   8 88   8  88  
  8ee88 88ee 88   8 88 88  8 88eee 88    8eee8 88   8  88
</pre>

Version: 1.1.0 - Released August 24, 2012 - Now with Windows Support!!!

*****

Imagine a world where you can write JavaScript to control blenders, lights, security systems, or even robots. Yes, I said robots. That world is here and now with node-serialport. It provides a very simple interface to the low level serial port code necessary to program [Arduino](http://www.arduino.cc/) chipsets, [X10](http://www.smarthome.com/manuals/protocol.txt) wireless communications, or even the rising [Z-Wave](http://www.z-wave.com/modules/ZwaveStart/) and [Zigbee](http://www.zigbee.org/) standards. The physical world is your oyster with this goodie. For a full break down of why we made this, please read [NodeBots - The Rise of JS Robotics](http://www.voodootikigod.com/nodebots-the-rise-of-js-robotics).

*****

Robots, you say?
================

This library is admittedly a base level toolkit for building amazing things with real world (including robots). Here are a couple of those amazing things that leverage node-serialport:

* [firmata](https://github.com/jgautier/firmata) Talk natively to Arduino using the firmata protocol.
* [tmpad](http://tmpvar.com/project/tmpad/) [source](https://github.com/tmpvar/tmpad) - a DIY midi pad using infrared, arduino, and nodejs. [Video](http://vimeo.com/34575470)
* [duino](https://github.com/ecto/duino) - A higher level framework for working with Arduinos in node.js.
* [Arduino Drinking Game Extravaganza](http://jsconf.eu/2011/arduino_drinking_game_extravaganza.html) - AKA "The Russian" a hexidecimal drinking game for geeks by Uxebu presented at JSConf EU 2011.
* [Arduino controlling popcorn.js](https://gist.github.com/968773) - Controlling a popcorn.js video with an Arduino kit.
* [Robotic JavaScript](http://jsconf.eu/2010/speaker/livingroombindmotion_function.html) - The first live presentation of the node-serialport code set as presented at JSConf EU 2010.
* [devicestack](https://github.com/adrai/devicestack) - This module helps you to represent a device and its protocol.

For getting started with node-serialport, we recommend you begin with the following articles:

* [Arduino Node Security Sensor Hacking](http://nexxylove.tumblr.com/post/20159263403/arduino-node-security-sensor-hacking) - A great all around "how do I use this" article.
* [NodeBots - The Rise of JS Robotics](http://www.voodootikigod.com/nodebots-the-rise-of-js-robotics) - A survey article of why one would want to program robots in JS.
* [Johnny-Five Getting Started Guide](https://github.com/rwldrn/johnny-five#setup-and-assemble-arduino) - Introduction to using the high level Johnny-Five library (awesome).

How To Use
==========

Using node-serialport is pretty easy because it is pretty basic. It provides you with the building block to make great things, it is not a complete solution - just a cog in the (world domination) machine.

To Install
----------

<pre>
  npm install serialport
</pre>

This assumes you have everything on your system necessary to compile ANY native module for Node.js. This may not be the case, though, so please ensure the following are true for your system before filing an issue about "Does not install". For all operatings systems, please ensure you have Python 2.x installed AND not 3.0, node-gyp (what we use to compile) requires Python 2.x.

### Windows:

Ensure you have Visual Studio 2010+ (Express is fine) installed. If you are hacking on an Arduino, be sure to install [the drivers](http://arduino.cc/en/Main/Software).

### Mac OS X:

Ensure that you have at a minimum the xCode Command Line Tools installed appropriate for your system configuration. If you recently upgrade OS, it probably removed your installation of Command Line Tools, please verify before submitting a ticket.

### Linux:

You know what you need for you system, basically your appropriate analog of build-essential. Keep rocking!


To Use
------

Opening a serial port:

<pre>
  var SerialPort = require("serialport").SerialPort
  var serialPort = new SerialPort("/dev/tty-usbserial1", {
    baudrate: 57600
  });
</pre>
  
When opening a serial port, you can specify (in this order).

1. Path to Serial Port - required.
1. Options - optional and described below.

The options object allows you to pass named options to the serial port during initialization. The valid attributes for the options object are the following:

* baudrate: Baud Rate, defaults to 9600. Must be one of: 115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300, 200, 150, 134, 110, 75, or 50.
* databits: Data Bits, defaults to 8. Must be one of: 8, 7, 6, or 5.
* stopbits: Stop Bits, defaults to 1. Must be one of: 1 or 2.
* parity: Parity, defaults to 'none'. Must be one of: 'none', 'even', 'mark', 'odd', 'space'
* buffersize: Size of read buffer, defaults to 255. Must be an integer value.
* parser: The parser engine to use with read data, defaults to rawPacket strategy which just emits the raw buffer as a "data" event. Can be any function that accepts EventEmitter as first parameter and the raw buffer as the second parameter.

**Note, we have added support for either all lowercase OR camelcase of the options (thanks @jagautier), use whichever style you prefer.**

open event
----------

You MUST wait for the open event to be emitted before reading/writing to the serial port. The open happens asynchronously so installing 'data' listeners and writing 
before the open event might result in... nothing at all.

Assuming you are connected to a serial console, you would for example:

<pre>
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
</pre>

You can also call the open function, in this case instanciate the serialport with an additional flag.

<pre>
var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/tty-usbserial1", {
  baudrate: 57600
}, false); // this is the openImmediately flag [default is true]

serialPort.open(function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
  });  
  serialPort.write("ls\n", function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });  
});
</pre>

List Ports
----------

You can also list the ports along with some metadata as well.

<pre>
  serialport.list(function (err, ports) {
    ports.forEach(function(port) {
      console.log(port.comName);
      console.log(port.pnpId);
      console.log(port.manufacturer);
    });
  });
</pre>

Parsers
-------

Out of the box, node-serialport provides two parsers one that simply emits the raw buffer as a data event and the other which provides familiar "readline" style parsing. To use the readline parser, you must provide a delimiter as such:

<pre>
  var serialport = require("serialport");
  var SerialPort = serialport.SerialPort; // localize object constructor
  
  var sp = new SerialPort("/dev/tty-usbserial1", { 
    parser: serialport.parsers.readline("\n") 
  });
</pre>

To use the raw parser, you just provide the function definition (or leave undefined):

<pre>
  var serialport = require("serialport");
  var SerialPort = serialport.SerialPort; // localize object constructor
  
  var sp = new SerialPort("/dev/tty-usbserial1", { 
    parser: serialport.parsers.raw
  });
</pre>


You can get updates of new data from the Serial Port as follows:

<pre>
  serialPort.on("data", function (data) {
    sys.puts("here: "+data);
  });
</pre>

You can write to the serial port by sending a string or buffer to the write method as follows:

<pre>
serialPort.write("OMG IT WORKS\r");
</pre>

Enjoy and do cool things with this code.

