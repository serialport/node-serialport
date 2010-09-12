var sys = require("sys");
var fs = require("fs");
var SerialPort = require("./serialport_native");
sp = SerialPort.open("/dev/tty");
sp.on("data", function(resp) {
  
});
sp.write(sp, "Test", "utf8");
sp.close(sp);
// sys.puts(sp);
// fs.write(sp, "test", null, "utf8");