////////////////////////////////////////////////////////
// Use the cool library                               //
// git://github.com/voodootikigod/node-serialport.git //
// to read the serial port where arduino is sitting.  //
////////////////////////////////////////////////////////               
var com = require("serialport");

var serialPort = new com.SerialPort("/dev/cu.usbmodemfd121", {
    baudrate: 9600,
    parser: com.parsers.readline('\r\n')
  });

serialPort.on('open',function() {
  console.log('Port open');
});

serialPort.on('data', function(data) {
  console.log(data);
});
