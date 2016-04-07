'use strict';

var assert = require('chai').assert;
var SerialPortBinding = require('bindings')('serialport.node');

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

describe('SerialPortBinding', function () {
  describe('.list', function () {
    if (platform === 'unix') {
      describe('on unix', function() {
        it('throws an error', function(done) {
          SerialPortBinding.list(function(err) {
            assert.instanceOf(err, Error);
            done();
          });
        });
      });
      return;
    }
    describe('on windows and darwin', function() {
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
          assert.isAtLeast(data.length, 1);
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
});
