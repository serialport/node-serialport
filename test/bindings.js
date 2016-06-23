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
  lock: true,
  platformOptions: {},
  // required for windows
  dataCallback: function() {},
  errorCallback: function() {},
  disconnectedCallback: function() {}
};

var defaultSetFlags = {
  brk: false,
  cts: false,
  dtr: true,
  dts: false,
  rts: true
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
      it('doesn\'t supports a custom baudRates of 25000');
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


    describe('optional locking', function(){
      // This section ensures that if we fail, we still close the fd
      var fileDescriptor = null;
      afterEach(function(done) {
        if (fileDescriptor) {
          SerialPortBinding.close(fileDescriptor, function(){
            done();
          });
        } else {
          done();
        }
      });

      it('locks the port by default', function(done) {
        SerialPortBinding.open(testPort, defaultPortOpenOptions, function(err, fd) {
          fileDescriptor = fd;
          assert.isNull(err);
          assert.isNumber(fd);
          SerialPortBinding.open(testPort, defaultPortOpenOptions, function(err, badFd) {
            SerialPortBinding.close(fd, function(){
              assert.instanceOf(err, Error);
              assert.isUndefined(badFd);
              done();
            });
          });
        });
      });

      if (platform === 'win32') {
        it('Ports currently cannot be unlocked on windows');
      } else {
        it('can unlock the port', function(done) {
          var noLock = assign({}, defaultPortOpenOptions, {lock: false});
          SerialPortBinding.open(testPort, noLock, function(err, fd) {
            fileDescriptor = fd;
            assert.isNull(err);
            assert.isNumber(fd);
            SerialPortBinding.open(testPort, defaultPortOpenOptions, function(err, otherFd) {
              assert.isNull(err);
              assert.isNumber(otherFd);
              SerialPortBinding.close(fd, function(err){
                assert.isNull(err);
                SerialPortBinding.close(otherFd, done);
              });
            });
          });
        });
      }
    });
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
      SerialPortBinding.close(this.fd, done);
      this.fd = null;
    });

    it('updates baudRate', function(done) {
      SerialPortBinding.update(this.fd, {baudRate: 57600}, done);
    });

    if (platform === 'win32') {
      it("doesn't yet support custom rates");
      return;
    }

    it('updates baudRate to a custom rate', function(done) {
      SerialPortBinding.update(this.fd, {baudRate: 25000}, function(err) {
        assert.isNull(err);
        done();
      });
    });
  });

  describe('#write', function() {
    if (!testPort) {
      it('Cannot be tested as we have no test ports on ' + platform);
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
      SerialPortBinding.close(this.fd, done);
      this.fd = null;
    });

    it('calls the write callback once after a small write', function(done){
      var data = new Buffer('simple write of 24 bytes');
      SerialPortBinding.write(this.fd, data, function(err){
        assert.isNull(err);
        done();
      });
    });

    it('calls the write callback once after a 5k write', function(done){
      this.timeout(20000);
      var data = new Buffer(1024 * 5);
      SerialPortBinding.write(this.fd, data, function(err){
        assert.isNull(err);
        done();
      });
    });
  });

  describe('#drain', function() {
    it('errors when given a bad fd', function(done) {
      SerialPortBinding.drain(44, function(err) {
        assert.instanceOf(err, Error);
        done();
      });
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
      SerialPortBinding.close(this.fd, done);
      this.fd = null;
    });

    it('drains the port', function(done) {
      SerialPortBinding.drain(this.fd, function(err) {
        assert.isNull(err);
        done();
      });
    });
  });

  describe('#set', function() {
    it('errors when given a bad fd', function(done) {
      SerialPortBinding.drain(44, function(err) {
        assert.instanceOf(err, Error);
        done();
      });
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
      SerialPortBinding.close(this.fd, done);
      this.fd = null;
    });

    it('sets flags on the port', function(done) {
      SerialPortBinding.set(this.fd, defaultSetFlags, function(err) {
        assert.isNull(err);
        done();
      });
    });
  });
});
