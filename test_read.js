// Test with the epic VirtualSerialPortApp - http://code.google.com/p/macosxvirtualserialport/

var SerialPort = require("./serialport").SerialPort;
var sys = require("sys"), repl = require("repl");

var serial_port = new SerialPort("/dev/master", 9600);

serial_port.on("data", function (data) {
  sys.puts("here: "+data);
})

repl.start("=>")

//serial_port.close();
