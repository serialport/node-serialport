/*jslint node: true */
/*global describe, it */
'use strict';

var chai = require('chai');
var util = require('util');
var serialPort = require('../serialport');
var colors = require('colors');
var fs = require('fs');
var memwatch = require('memwatch');

describe ('stress', function() {

  describe('long running', function() {
    it('opens a port and sends data, repeated indefinately', function (done) {

      var hd = new memwatch.HeapDiff();

      memwatch.on('leak', function(info) {
        fs.appendFile('leak.log', util.inspect(info));
        console.log(util.inspect(info).red);

        var diff = hd.end();
        fs.appendFile('heapdiff.log', util.inspect(diff));
        hd = new memwatch.HeapDiff();
      });

      memwatch.on('stats', function (stats) {
        fs.appendFile('stats.log', util.inspect(stats));
        console.log(util.inspect(stats).green);
      });

      serialPort.list(function(err, ports) {

        chai.assert.isUndefined(err, util.inspect(err));
        chai.assert.isDefined(ports, 'ports is not defined');
        chai.assert.isTrue(ports.length > 0, 'no ports found');

        var data = new Buffer('hello');

        var port = new serialPort.SerialPort(ports.slice(-1)[0].comName, null, false);
        port.on('error', function(err) {
          chai.assert.fail(util.inspect(err));
        });

        port.on('data', function (data) {
        });

        port.open(function(err) {
          chai.assert.isUndefined(err, util.inspect(err));


          var intervalId = setInterval(function () {
            port.write(data);
          }, 20 );

          setTimeout(function() {

            clearInterval(intervalId);

            var diff = hd.end();
            fs.appendFile('heapdiff.log', util.inspect(diff));

            console.log(util.inspect(diff).green);

            done();

          }, 3590000);
        });
      });
    });
  });

});
