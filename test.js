var sys = require("sys");
var SerialPort = require("./serialport_native").SerialPort;
sp = new SerialPort;
sp.open("/dev/tty");

var d = "TEST";
sp.write(d);
sp.close();

/*
sp.on("data", function(resp) {
  
});
sp.write(sp, "Test", "utf8");
sp.close(sp);
*/
// sys.puts(sp);
// fs.write(sp, "test", null, "utf8");
