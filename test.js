var sys = require("sys");
var SerialPort = require("./serialport_native").SerialPort;
sp = new SerialPort;
sp.open("./sampleport");

var str = "TEST";
sp.write(str);

var buf = new Buffer([0x02, 0x03, 0x05, 0x02, 0x01]);
sp.write(buf);

sp.close();

/*
sp.on("data", function(resp) {
  
});
sp.write(sp, "Test", "utf8");
sp.close(sp);
*/
// sys.puts(sp);
// fs.write(sp, "test", null, "utf8");
