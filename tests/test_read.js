// Test with the epic VirtualSerialPortApp - http://code.google.com/p/macosxvirtualserialport/

var SerialPort = require("../serialport").SerialPort;
var sys = require("sys"), repl = require("repl");

var serial_port = new SerialPort("/dev/master", {baudrate: 9600});

serial_port.on("data", function (data) {
  sys.puts("here: "+data);
})
serial_port.on("error", function (msg) {
  sys.puts("error: "+msg);
})
repl.start("=>")

//serial_port.close();
