////////////////////////////////////////////////////////
// Use the cool library                               //
// git://github.com/voodootikigod/node-serialport.git //
// to reset an arduino														 .  //
////////////////////////////////////////////////////////               
var com = require("serialport");

var serialPort = new com.SerialPort("/dev/tty.usbserial-A700eTSd", {
    baudrate: 115200,
    parser: com.parsers.readline('\r\n')
  }, false);

serialPort.on('open',function() {
  console.log('Port open');
});

serialPort.on('data', function(data) {
  console.log(data);
});

function asserting() {
  console.log('asserting');
	serialPort.set({brk:true}, function(err, something) {
	  console.log('asserted');
		setTimeout(clear, 5000);
	});
}

function clear() {
	console.log('clearing');
	serialPort.set({br:false}, function(err, something) {
	  console.log('clear');
		done();
	});
}

function done() {
	console.log("done breaking");
}
