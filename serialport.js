var puts = function(str) { process.stdout.write(str); };
var serial_port = require("./serialport_native")
var sp = serial_port.open("/dev/tty")
sp.write("test");
sp.close();