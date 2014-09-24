var SerialPort = require('serialport').SerialPort;

process.stdin.on('data', function() {});

process.stdin.on('end', function() {
  var sp = new SerialPort('/dev/tty.usbmodemfd121');
  sp.on('open', function() {
    console.log('SerialPort FD:', sp.fd);

    sp.write('this will not get sent');

    setTimeout(process.exit, 100);
  });
});
