'use strict';

var assert = require('chai').assert;
var SerialPortBinding = require('../lib/bindings');
var assign = require('object.assign').getPolyfill();

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

describe('SerialPortBinding', function() {
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
      it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
      return;
    }

    it('returns a file descriptor', function(done) {
      SerialPortBinding.open(testPort, defaultPortOpenOptions, function(err, fd) {
        assert.isNull(err);
        assert.isNumber(fd);
        SerialPortBinding.close(fd, done);
      });
    });

    if (platform === 'win32') {
      it('doesn\'t supports a custom baudRates');
    } else {
      it('supports a custom baudRate of 25000', function(done) {
        var customRates = assign({}, defaultPortOpenOptions, {baudRate: 25000});
        SerialPortBinding.open(testPort, customRates, function(err, fd) {
          assert.isNull(err);
          assert.isNumber(fd);
          SerialPortBinding.close(fd, done);
        });
      });
    }
  });

  describe('#close', function() {
    it('errors when providing a bad file descriptor', function(done) {
      SerialPortBinding.close(-1, function(err) {
        assert.instanceOf(err, Error);
        done();
      });
    });

    if (!testPort) {
      it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
      return;
    }

    it('closes an open file descriptor', function(done) {
      SerialPortBinding.open(testPort, defaultPortOpenOptions, function(err, fd) {
        assert.isNull(err);
        assert.isNumber(fd);
        SerialPortBinding.close(fd, function(err) {
          assert.isNull(err);
          done();
        });
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

  describe('#update', function() {
    if (platform === 'win32') {
      it('on windows it returns an error', function(done) {
        SerialPortBinding.update(99, defaultPortOpenOptions, function(err, data) {
          assert.instanceOf(err, Error);
          assert.isUndefined(data);
          done();
        });
      });
      return;
    }

    it('errors when updating nothing', function(done) {
      try {
        SerialPortBinding.update(99, {}, function() {});
      } catch (err) {
        assert.instanceOf(err, Error);
        done();
      }
    });

    if (!testPort) {
      it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.');
      return;
    }

    beforeEach(function(done) {
      SerialPortBinding.open(testPort, defaultPortOpenOptions, function(err, fd) {
        assert.isNull(err);
        assert.isNumber(fd);
        this.fd = fd;
        done();
      }.bind(this));
    });

    afterEach(function(done) {
      var fd = this.fd;
      this.fd = null;
      SerialPortBinding.close(fd, done);
    });

    it('updates baudRate', function(done) {
      SerialPortBinding.update(this.fd, {baudRate: 57600}, done);
    });

    it('updates baudRate to a custom rate', function(done) {
      SerialPortBinding.update(this.fd, {baudRate: 25000}, function(err) {
        assert.isNull(err);
        done();
      });
    });
  });
});
