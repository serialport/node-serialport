var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

serialport.list(function(err, ports) {
    console.log(ports);

});

var sp = new SerialPort("/dev/tty.usbmodem1421", {
    baudrate: 9600,
    parser: serialport.parsers.readline("\n")
});

var i = 1;

sp.on("open", function() {
    console.log('open');
    sp.on('data', function(data) {
        console.log('count : ' + (i++));
        console.log('data received: ' + data);
    });

    sp.on('disconnect', function(err) {
        console.log('on.disconnect');
    });

    sp.on('error', function(err) {
        console.log("Erreur ?? " + err);
    });

    sp.on('close', function() {
        console.log("Someone close the port ...");
    });
});

setTimeout(function() {
    sp.close(function() {
        console.log("We're closing");
    });
}, 10000);
