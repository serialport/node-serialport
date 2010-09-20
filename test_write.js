var SerialPort = require("./serialport").SerialPort;
var sys = require("sys");

var serial_port = new SerialPort("./sampleport");
serial_port.write("test");
serial_port.close();