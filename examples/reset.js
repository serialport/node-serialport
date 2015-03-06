////////////////////////////////////////////////////////
// Use the cool library                               //
// git://github.com/voodootikigod/node-serialport.git //
// to reset an arduino.                               //
////////////////////////////////////////////////////////               
var com = require("serialport");

var serialPort = new com.SerialPort("/dev/tty.usbmodem1411", {
    baudrate: 115200,
    parser: com.parsers.readline('\r\n')
  });

serialPort.on('open',function() {
  console.log('Port open');
  // note you get a dtr for free on port open so lets wait 5 seconds
  // to make sure ours is seperate from that one
  setTimeout(asserting, 5000);
});

serialPort.on('data', function(data) {
  console.log(data);
});

function asserting() {
  console.log('asserting');
    //NOTE: you actually de-assert rts and dtr to toggle!
    serialPort.set({rts:false, dtr:false}, function(err, something) {
      console.log('asserted');
        setTimeout(clear, 5000);
    });
}

function clear() {
    console.log('clearing');
    serialPort.set({rts:true, dtr:true}, function(err, something) {
      console.log('clear');
        setTimeout(done, 5000);
    });
}

function done() {
    console.log("done resetting");
}
