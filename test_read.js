var SerialPort = require("./serialport").SerialPort;
var sys = require("sys");

var serial_port = new SerialPort("/tmp/sampleport");
serial_port.on("data", function (data) {
  
  sys.puts("here: "+data);
})
// serial_port.close();
