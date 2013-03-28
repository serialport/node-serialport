////////////////////////////////////////////////////////
// Use the cool library                               //
// git://github.com/voodootikigod/node-serialport.git //
// to read the serial port where arduino is sitting.  //
////////////////////////////////////////////////////////               
var com = require("serialport");

var serialPort = new com.SerialPort("/dev/cu.usbmodemfd121", {
    baudrate: 9600,
    parser: com.parsers.readline('\r')
  });

serialPort.on('open',function() {
  console.log('Port open');
});

////////////////////////////////////////////////////////
// Strangely enough, the readLine parser, although it //
// correctly detects the delimiter '\r', it leaves it //
// in the buffer. Here's my crude attempt to strip it //
// out. Yes, I tried replace(/(\r)/g,'') but didn't   //
// work.                                              //
////////////////////////////////////////////////////////
serialPort.on('data', function(data) {
  var buffer = "";
  for (var i=0;i<data.length;i++) {
      if (data.charCodeAt(i)!=10)
          buffer+=data[i];
  }
  console.log(buffer);
});
