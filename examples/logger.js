/*
  Simple example that takes a command line provided serial port destination and routes the output to a file of the same name with .log appended to the port name.
  
  usage: node logger.js /dev/tty.usbserial <baudrate>
  
*/

var SerialPort = require("serialport");
var fs = require("fs");
var port = process.argv[2];
var baudrate = process.argv[3];
if (!port) {
  console.log("You must specify a serial port location.");
} else {
  var target = port.split("/");
  target = target[target.length-1]+".log";
  if (!baudrate) {
    baudrate = 115200;
  }
  fs.open("./"+target, 'w', function (err, fd) {
    fs.write(fd, "\n------------------------------------------------------------\nOpening SerialPort: "+target+" at "+Date.now()+"\n------------------------------------------------------------\n");  
    var serialPort = new SerialPort.SerialPort(port, {
      baudrate: baudrate
    });
    serialPort.on("data", function (data) {
      fs.write(fd, data.toString());
    });
    serialPort.on("close", function (data) {
      fs.write(fd, "\n------------------------------------------------------------\nClosing SerialPort: "+target+" at "+Date.now()+"\n------------------------------------------------------------\n");  
    });
  });
}


