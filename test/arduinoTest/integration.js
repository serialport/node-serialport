'use strict';
var crypto = require('crypto');
var assert = require('chai').assert;
var SerialPort = require('../../');

var platform;
switch (process.platform) {
  case 'win32':
    platform = 'win32';
    break;
  case 'darwin':
    platform = 'darwin';
    break;
  default:
    platform = 'unix';
}

var testPort = process.env.TEST_PORT;

describe('SerialPort Integration Tests', function() {
  if (!testPort) {
    it('Requires an Arduino loaded with the arduinoEcho program on a serialport set to the TEST_PORT env var');
    return;
  }

  it('.list', function(done) {
    SerialPort.list(function(err, ports) {
      var foundPort = false;
      ports.forEach(function(port) {
        if (port.comName === testPort){
          foundPort = true;
        }
      });
      assert.isTrue(foundPort, 'Could not find the port: ' + testPort + " in \n" + JSON.stringify(ports));
      done();
    });
  });

  // Be careful to close the ports when you're done with them
  // Ports are exclusively locked in windows and maybe other platforms eventually

  describe('#update', function() {
    if (platform === 'win32') {
      return it("Isn't supported on windows yet");
    }

    // This can't be tested on an UNO because it resets the uno
    it('can still read and write after a baud change');//, function(done) {
    //   var port = new SerialPort(testPort, {
    //     parser: SerialPort.parsers.byteLength(1)
    //   });

    //   port.once('data', function(message) {
    //     assert.deepEqual(message, new Buffer([0]));
    //     // set baud to 57600
    //     port.write(new Buffer([130]), function(err){
    //       assert.equal(err, null);
    //     });
    //     port.update({baudRate: 57600}, function(err){
    //       assert.equal(err, null);
    //     });

    //     // The arduino will change rates after the write
    //     // sleep 500ms and let us know it's done
    //     port.once('data', function(message){
    //       assert.deepEqual(message, new Buffer([130]));
    //       // Then lets see if we can still chat
    //       port.write('!');
    //       port.once('data', function(message){
    //         assert.deepEqual(message, new Buffer('!'));
    //         port.close(done);
    //       });
    //     });
    //   });
    // });
  });

  describe('#read and #write', function() {
    it('writes 5k and reads it back', function(done) {
      this.timeout(20000);
      // 5k of random ASCII
      var output = new Buffer(crypto.randomBytes(5000).toString('ascii'));
      var expectedInput = Buffer.concat([new Buffer([0]), output]);
      var port = new SerialPort(testPort);

      // this will trigger from the ready byte the arduino sends when it's... ready
      port.once('data', function(){
        port.write(output);
      });

      var input = new Buffer(0);
      port.on('data', function(data) {
        input = Buffer.concat([input, data]);
        if (input.length === expectedInput.length){
          assert.deepEqual(expectedInput, input);
          port.close(done);
        }
      });
    });
  });
});
