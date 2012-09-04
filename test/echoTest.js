// Test with the Arduino sketch echo.ino

var serialPort = require("../serialport");
var assert = require('chai').assert;

describe('Echo', function() {
    
  it('responds', function(done) {

    var portName;

    serialPort.list(function (err, results) {
      if (err) {
        throw err;
      }

      for (var i = 0; i < results.length; i++) {
        var item = results[i];

        // Under Windows this catches any Arduino that is loaded using the Teensyduino INF.
        // Hardcoded to detect a Teensy INF device for now.  Teensy INF works with Leonardo too.
        if (item.manufacturer && item.manufacturer.indexOf('PJRC') != -1) {
          portName = results[i].comName;
          break;
        }

        // Under Ubuntu 12.04 this catches a Leonardo.
        if (item.pnpId && item.pnpId.indexOf('Arduino') != -1) {
          portName = results[i].comName;
          break;          
        }

        // Under Ubuntu 12.04 this catches a Teensy.
        if (item.pnpId && item.pnpId.indexOf('Teensy') != -1) {
          portName = results[i].comName;
          break;          
        }
      }

      console.log("Arduino found on " + portName);

      var readData = new Buffer(0);
      var sp = new serialPort.SerialPort(portName, { baudRate: 57600 });

      var writeSequence = 0;

      var sendFrame = function(data) {
        
        if (typeof data !== "Buffer") {
          data = new Buffer(data);
        }

        sp.write(Buffer.concat([ new Buffer([ writeSequence++ ]), data ] ));
      }

      // Concatenate the incoming data together 
      sp.on('data', function (data) {

        if (readData.length == 0) {
          readData = data;
        } else {
          readData = Buffer.concat([readData, data]);
        }
      });

      sp.on('close', function (err) {
        console.log('port closed');
      });

      sp.on('error', function (err) {
        console.error("error", err);
      });

      var readSequence = -1;

      var loop = function() {

        while (readData.length > 3) {

          var frameSequence = readData[0];

          // Manual 8 bit rollover for readSequence
          if (readSequence++ === 255) {
            readSequence = 0;
          }

          // We have a 'full frame' of data, so read it out
          if (frameSequence !== readSequence) {
            console.log("Out Of Sequence, expected " + readSequence + " received " + frameSequence);
            readSequence = frameSequence; // Reset the sequence to match next expected
          }

          console.log(frameSequence + ' : ' + readData.toString('utf8', 1, 4));
          readData = readData.slice(4); // Remove the frame from the readData buffer
        }

        sendFrame('abc');
        sendFrame('def');
        sendFrame('ghi');
      }

      sp.on('open', function () {
        setInterval(loop, 200);
      });
    });
  });
});