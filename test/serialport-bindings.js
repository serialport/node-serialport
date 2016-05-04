'use strict';

var assert = require('chai').assert;
var SerialPortBinding = require('../lib/bindings');

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

var defaultPortOpenOptions = {
  baudRate: 9600,
  parity: 'none',
  xon: false,
  xoff: false,
  xany: false,
  rtscts: false,
  hupcl: true,
  dataBits: 8,
  stopBits: 1,
  bufferSize: 64 * 1024,
  platformOptions: {},
  // required for windows
  dataCallback: function() {},
  errorCallback: function() {},
  disconnectedCallback: function() {}
};

var testPort = process.env.TEST_PORT;

describe('SerialPortBinding', function () {
  describe('#open', function() {
    it('errors when providing a bad port', function(done) {
      SerialPortBinding.open('COMBAD', defaultPortOpenOptions, function(err, fd) {
        assert.instanceOf(err, Error);
        assert.include(err.message, 'COMBAD');
        assert.isUndefined(fd);
        done();
      });
    });

    if (!testPort) {
      it('Cannot be tested as we have no test ports on ' + platform);
      return;
    }

    it('returns a file descriptor', function(done) {
      SerialPortBinding.open(testPort, defaultPortOpenOptions, function(err, fd) {
        assert.isNull(err);
        assert.isNumber(fd);
        SerialPortBinding.close(fd, done);
      });
    });
  });

  describe('#list', function() {
    it('returns an array', function(done) {
      SerialPortBinding.list(function(err, data) {
        assert.isNull(err);
        assert.isArray(data);
        done();
      });
    });

    it('has objects with undefined when there is no data', function(done) {
      SerialPortBinding.list(function(err, data) {
        assert.isNull(err);
        assert.isArray(data);
        if (data.length === 0) {
          console.log('no ports to test');
          return done();
        }
        var obj = data[0];
        Object.keys(obj).forEach(function(key) {
          assert.notEqual(obj[key], '', 'empty values should be undefined');
          assert.isNotNull(obj[key], 'empty values should be undefined');
        });
        done();
      });
    });
  });
});
