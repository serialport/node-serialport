Alpha Code - changes more often than node.js itself.

If you want to try, use it like this:

  var SerialPort = require("./serialport")
  var sp = new SerialPort("/dev/ttyUSB0")
  sp.write("OMG USB");

  // Reading is not perfect yet
  sp.on('data', function(data) {
    sys.puts("data");
  });             

  sp.close();
