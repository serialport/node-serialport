// disconnect.js -- an attempt track down the disconnected issue.

//"use strict";
var serialPort = require("../serialport");

var sp;
function activate () {

if (sp) {
  sp = new serialPort.SerialPort(process.env.SERIAL_PORT, {
    baudRate: 115200,
    parser  : serialPort.parsers.readline(';')
  });


  sp.on('data', function (data) {
    console.log('on.data', data);
    sp.close(function(err) {
      console.log('close()', err);
    });
  });

  sp.on('close', function (err) {
    console.log('on.close');
    sp = null;
  });


  sp.on('disconnect', function (err) {
    console.log('on.disconnect');


  });


  sp.on('error', function (err) {
    console.error("on.error", err);
  });

  sp.on('open', function () {
    console.log('on.open');
    sp.write("foobar;", function(err, chars) {
      console.log('write()', chars, err);
    });
  });

  }
}

activate()

//keep alive
setInterval(function() { activate(); }, 10000);