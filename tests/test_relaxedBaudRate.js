var SerialPort = require("../serialport").SerialPort;
var util = require('util');

var serial_port = new SerialPort("/dev/slave", {baudrate: 5});
serial_port.write("This is a test");
util.puts("wrote buffer");
serial_port.close();
