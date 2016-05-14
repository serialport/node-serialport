'use strict';

// `npm run stress` to run these tests

var assert = require('chai').assert;
var util = require('util');
var serialPort = require('../../');
require('colors'); // this modifies String.prototype
// var fs = require('fs');

// Installing memwatch-next via package.json fails on node 10 on linux on our CI;
// Pending https://github.com/marcominetti/node-memwatch/issues/15
try {
  var memwatch = require('memwatch-next');
} catch (e) {
  console.error('Please install memwatch-next to use the stress tests');
  process.exit(-1);
}

describe('the stress', function() {
  var testPort = process.env.TEST_PORT;

  if (!testPort) {
    it('cannot be tested as we have no test ports');
    return;
  }

  describe('of 2 minutes of running 1k writes', function() {
    if (process.version.match('v0.10.')) {
      it('either leaks like a siv or memwatch is broken on v10');
      return;
    }

    it("doesn't leak memory", function(done) {
      var data = new Buffer(1024);
      var hd = new memwatch.HeapDiff();
      var port = new serialPort.SerialPort(testPort, {}, false);
      port.on('close', done);

      var leaks = 0;
      memwatch.on('leak', function(info) {
        // fs.appendFile('leak.log', util.inspect(info));
        console.log(util.inspect(info, {depth: 5}).red);
        leaks++;
      });

      // memwatch.on('stats', function (stats) {
      //   fs.appendFile('stats.log', util.inspect(stats));
      // });

      port.on('error', function(err) {
        assert.fail(util.inspect(err));
        done();
      });

      port.on('data', function() {});

      var writing = true;
      var write = function() {
        if (!writing) { return }
        port.write(data, write);
      };

      port.open(function(err) {
        assert.isUndefined(err);
        write();

        setTimeout(function() {
          console.log('cleaning up');
          // var diff = hd.end();
          // fs.appendFile('heapdiff.log', util.inspect(diff));
          // console.log(util.inspect(diff, {depth: 5}).blue);
          writing = false;

          if (leaks > 0) {
            var diff = hd.end();
            // fs.appendFile('heapdiff.log', util.inspect(diff, {depth: 5}));
            console.log(util.inspect(diff, {depth: 5}).red);
            assert.fail('leak detected');
          }
          port.close();
        }, 1000 * 60 * 2);
      });
    });
  });

  // describe('of opening and closing ports', function() {
  //   it("doesn't leak memory", function(done) {
  //     var hd = new memwatch.HeapDiff();
  //     var port = new serialPort.SerialPort(testPort, {}, false);

  //     memwatch.on('leak', function(info) {
  //       // fs.appendFile('leak.log', util.inspect(info));
  //       console.log(util.inspect(info, {depth: 5}).red);

  //       var diff = hd.end();
  //       // fs.appendFile('heapdiff.log', util.inspect(diff, {depth: 5}));
  //       console.log(util.inspect(diff, {depth: 5}).red);
  //       assert.fail('leak detected');
  //       port.close();
  //     });

  //     var open, close;
  //     open = function() {
  //       process.nextTick(function() {
  //         port.open(close);
  //       });
  //     };

  //     var looping = true;
  //     close = function() {
  //       if (looping) {
  //         process.nextTick(function() {
  //           port.close(open);
  //         });
  //       } else {
  //         port.close();
  //       }
  //     };
  //     setTimeout(function() {
  //       looping = false;
  //       port.on('close', done);
  //     }, 1000 * 10);

  //     open();
  //   });
  // });
});
