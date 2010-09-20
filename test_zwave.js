var SerialPort = require("./serialport").SerialPort;
var sys = require("sys");

var serial_port = new SerialPort("./sampleport");
serial_port.write(new Buffer([0x01, 0x03, 0x00, 0x20,220]));

// serial_port.on("data", function(d){ sys.puts(d); serial_port.close(); });
