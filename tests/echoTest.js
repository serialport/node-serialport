// Test with the epic VirtualSerialPortApp - http://code.google.com/p/macosxvirtualserialport/

var SerialPort = require("../serialport").SerialPort;
var assert = require('assert');

var keepAlive = setTimeout(function () {
  console.log('timeout');
  process.exit();
}, 10000);

var portName;

if (process.platform == 'win32') {
  portName = 'COM4';
} else if (process.platform == 'darwin') {
  portName = '/dev/cu.usbserial-A800eFN5';
} else {
  portName = '/dev/ttyUSB0';
}

var readData = '';
var sp = new SerialPort(portName, {
  baudRate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: false
});
sp.on('data', function (data) {
  readData += data.toString();
  console.log('read buffer:', readData);
  if (readData.indexOf('READY') >= 0) {
    readData = '';
    sp.write("hello world", function (err, bytesWritten) {
      console.log('bytes written:', bytesWritten);
    });
  }
  if (readData === "HELLO WORLD") {
    sp.close();
    clearTimeout(keepAlive);
    console.log('done');
  }
});

sp.on('close', function (err) {
  console.log('port closed');
});

sp.on('error', function (err) {
  console.error("error", err);
});

sp.on('open', function () {
  console.log('port opened... Press reset on the Arduino.');
});

