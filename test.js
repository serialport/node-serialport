var sys = require("sys");
var fs = require("fs");

var SerialPort = require("./serialport_native").SerialPort;


var fd = SerialPort.open("./sampleport");
fs.close(fd);

